import * as cdk from 'aws-cdk-lib';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as route53Targets from 'aws-cdk-lib/aws-route53-targets';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import { Construct } from 'constructs';
import { DevAccessGateFunction } from '../constructs/dev-access-gate-function';
import { hasCustomDomain, resolveHostedZone, webOriginUrl } from '../constructs/hosted-zone';
import { isDevAccessEnabled } from '../config/types';
import { resourceName } from '../constructs/naming';
import { SiteCertificate } from '../constructs/site-certificate';
import { Afro90sStackProps, cfnExportName } from './stack-props';

export class FrontendStack extends cdk.Stack {
  public readonly webBucket: s3.Bucket;
  public readonly webDistribution: cloudfront.Distribution;
  /** Shared ACM cert (apex + wildcard) — consumed by ApiStack via app.ts. */
  public readonly siteCertificate?: acm.ICertificate;

  constructor(scope: Construct, id: string, props: Afro90sStackProps) {
    super(scope, id, props);

    const { config } = props;
    const isProd = config.env === 'prod';
    const customDomain = hasCustomDomain(config);
    const assetsBucketName = resourceName(config, 's3', 'assets');
    const assetsBucketArn = `arn:aws:s3:::${assetsBucketName}`;

    this.webBucket = new s3.Bucket(this, 'WebBucket', {
      bucketName: resourceName(config, 's3', 'web'),
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      versioned: false,
      removalPolicy: isProd ? cdk.RemovalPolicy.RETAIN : cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: !isProd,
      enforceSSL: true,
      lifecycleRules: [
        {
          id: 'AbortIncompleteMultipartUploads',
          abortIncompleteMultipartUploadAfter: cdk.Duration.days(7),
        },
      ],
    });

    const securityHeadersPolicy = new cloudfront.ResponseHeadersPolicy(
      this,
      'WebSecurityHeaders',
      {
        responseHeadersPolicyName: resourceName(config, 'cf', 'web-security-headers'),
        securityHeadersBehavior: {
          strictTransportSecurity: {
            accessControlMaxAge: cdk.Duration.days(365),
            includeSubdomains: true,
            preload: true,
            override: true,
          },
          contentTypeOptions: { override: true },
        },
      },
    );

    // CloudFront allows one Function per event type per behavior.
    // Prod custom domain: www→apex redirect; assets behaviors merge redirect + strip /assets.
    const wwwRedirectCode = `
function wwwRedirect(request) {
  var host = request.headers.host.value;
  if (host.indexOf('www.') === 0) {
    var qs = '';
    var keys = Object.keys(request.querystring);
    if (keys.length > 0) {
      var parts = [];
      for (var i = 0; i < keys.length; i++) {
        var k = keys[i];
        var entry = request.querystring[k];
        if (entry.multiValue) {
          for (var j = 0; j < entry.multiValue.length; j++) {
            parts.push(encodeURIComponent(k) + '=' + encodeURIComponent(entry.multiValue[j].value));
          }
        } else {
          parts.push(encodeURIComponent(k) + '=' + encodeURIComponent(entry.value));
        }
      }
      qs = '?' + parts.join('&');
    }
    return {
      statusCode: 301,
      statusDescription: 'Moved Permanently',
      headers: {
        location: { value: 'https://' + host.substring(4) + request.uri + qs },
      },
    };
  }
  return null;
}
`.trim();

    const stripAssetsPrefixFn = new cloudfront.Function(this, 'StripAssetsPrefixFn', {
      functionName: resourceName(config, 'cf', 'strip-assets-prefix'),
      code: cloudfront.FunctionCode.fromInline(
        customDomain
          ? `
${wwwRedirectCode}
function handler(event) {
  var request = event.request;
  var redirect = wwwRedirect(request);
  if (redirect) return redirect;
  if (request.uri.startsWith('/assets')) {
    request.uri = request.uri.substring(7) || '/';
  }
  return request;
}
`.trim()
          : `
function handler(event) {
  var request = event.request;
  if (request.uri.startsWith('/assets')) {
    request.uri = request.uri.substring(7) || '/';
  }
  return request;
}
`.trim(),
      ),
    });

    const wwwRedirectFn = customDomain
      ? new cloudfront.Function(this, 'WwwRedirectFn', {
          functionName: resourceName(config, 'cf', 'www-redirect'),
          code: cloudfront.FunctionCode.fromInline(
            `
${wwwRedirectCode}
function handler(event) {
  var request = event.request;
  var redirect = wwwRedirect(request);
  if (redirect) return redirect;
  return request;
}
`.trim(),
          ),
        })
      : undefined;

    const devAccessGate = isDevAccessEnabled(config)
      ? new DevAccessGateFunction(this, 'DevAccessGate', {
          config,
          devAccess: config.devAccess!,
        })
      : undefined;

    // Prod custom domain uses www redirect; never overlaps with dev-access gate (dev only).
    const spaViewerRequestAssociations: cloudfront.FunctionAssociation[] = wwwRedirectFn
      ? [
          {
            function: wwwRedirectFn,
            eventType: cloudfront.FunctionEventType.VIEWER_REQUEST,
          },
        ]
      : devAccessGate
        ? [
            {
              function: devAccessGate.function,
              eventType: cloudfront.FunctionEventType.VIEWER_REQUEST,
            },
          ]
        : [];

    const webOrigin = origins.S3BucketOrigin.withOriginAccessControl(this.webBucket);
    const assetsBucket = s3.Bucket.fromBucketName(this, 'ImportedAssetsBucket', assetsBucketName);
    const assetsOrigin = origins.S3BucketOrigin.withOriginAccessControl(assetsBucket);

    const viewerProtocolPolicy = cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS;
    const webBehaviorBase = {
      origin: webOrigin,
      viewerProtocolPolicy,
      responseHeadersPolicy: securityHeadersPolicy,
      ...(spaViewerRequestAssociations.length > 0
        ? { functionAssociations: spaViewerRequestAssociations }
        : {}),
    };

    const assetsBehaviorBase = {
      origin: assetsOrigin,
      viewerProtocolPolicy,
      responseHeadersPolicy: securityHeadersPolicy,
      allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD,
      functionAssociations: [
        {
          function: stripAssetsPrefixFn,
          eventType: cloudfront.FunctionEventType.VIEWER_REQUEST,
        },
      ],
    };

    const hostedZone = resolveHostedZone(this, 'HostedZone', config);
    const siteCertificateConstruct =
      customDomain && hostedZone
        ? new SiteCertificate(this, 'SiteCertificate', { config, hostedZone })
        : undefined;
    this.siteCertificate = siteCertificateConstruct?.certificate;

    const apexDomain = customDomain ? config.domainName! : undefined;
    const wwwDomain = apexDomain ? `www.${apexDomain}` : undefined;

    this.webDistribution = new cloudfront.Distribution(this, 'WebDistribution', {
      comment: resourceName(config, 'cf', 'web'),
      defaultRootObject: 'index.html',
      priceClass: cloudfront.PriceClass.PRICE_CLASS_200,
      domainNames: apexDomain && wwwDomain ? [apexDomain, wwwDomain] : undefined,
      certificate: this.siteCertificate,
      defaultBehavior: {
        ...webBehaviorBase,
        cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED,
      },
      additionalBehaviors: {
        // S3 key: products/{productId}/{uuid}.ext — two segments after /assets/products/
        'assets/products/*/*': {
          ...assetsBehaviorBase,
          cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
        },
        'assets/*': {
          ...webBehaviorBase,
          cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
        },
        'index.html': {
          ...webBehaviorBase,
          cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED,
        },
      },
      errorResponses: [
        {
          httpStatus: 403,
          responseHttpStatus: 200,
          responsePagePath: '/index.html',
          ttl: cdk.Duration.seconds(0),
        },
      ],
    });

    if (customDomain && hostedZone) {
      new route53.ARecord(this, 'WebAliasRecord', {
        zone: hostedZone,
        target: route53.RecordTarget.fromAlias(
          new route53Targets.CloudFrontTarget(this.webDistribution),
        ),
      });

      new route53.ARecord(this, 'WwwAliasRecord', {
        zone: hostedZone,
        recordName: 'www',
        target: route53.RecordTarget.fromAlias(
          new route53Targets.CloudFrontTarget(this.webDistribution),
        ),
      });

      new ssm.StringParameter(this, 'SiteCertificateArnParam', {
        parameterName: `/afro90s/${config.env}/site-certificate-arn`,
        stringValue: this.siteCertificate!.certificateArn,
      });
    }

    // Imported bucket: CDK cannot attach OAC policy automatically — set it here (same stack as distribution).
    new s3.CfnBucketPolicy(this, 'AssetsBucketCloudFrontPolicy', {
      bucket: assetsBucketName,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Sid: 'DenyInsecureTransport',
            Effect: 'Deny',
            Principal: { AWS: '*' },
            Action: 's3:*',
            Resource: [assetsBucketArn, `${assetsBucketArn}/*`],
            Condition: { Bool: { 'aws:SecureTransport': 'false' } },
          },
          {
            Sid: 'AllowCloudFrontOACRead',
            Effect: 'Allow',
            Principal: { Service: 'cloudfront.amazonaws.com' },
            Action: 's3:GetObject',
            Resource: `${assetsBucketArn}/*`,
            Condition: {
              StringEquals: {
                'AWS:SourceArn': this.webDistribution.distributionArn,
              },
            },
          },
        ],
      },
    });

    const cloudFrontWebUrl = customDomain
      ? webOriginUrl(config)
      : `https://${this.webDistribution.distributionDomainName}`;
    const assetsCdnUrl = `${cloudFrontWebUrl}/assets`;

    new ssm.StringParameter(this, 'CloudFrontWebUrlParam', {
      parameterName: `/afro90s/${config.env}/cloudfront-web-url`,
      stringValue: cloudFrontWebUrl,
    });

    new ssm.StringParameter(this, 'AssetsCdnUrlParam', {
      parameterName: `/afro90s/${config.env}/assets-cdn-url`,
      stringValue: assetsCdnUrl,
    });

    new cdk.CfnOutput(this, 'CloudFrontWebUrl', {
      value: cloudFrontWebUrl,
      exportName: cfnExportName(config, 'CloudFrontWebUrl'),
    });

    new cdk.CfnOutput(this, 'AssetsCdnUrl', {
      value: assetsCdnUrl,
      exportName: cfnExportName(config, 'AssetsCdnUrl'),
    });
  }
}
