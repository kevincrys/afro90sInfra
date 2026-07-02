import * as cdk from 'aws-cdk-lib';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import { Construct } from 'constructs';
import { resourceName } from '../constructs/naming';
import { Afro90sStackProps } from './stack-props';

export class FrontendStack extends cdk.Stack {
  public readonly webBucket: s3.Bucket;
  public readonly webDistribution: cloudfront.Distribution;

  constructor(scope: Construct, id: string, props: Afro90sStackProps) {
    super(scope, id, props);

    const { config } = props;
    const isProd = config.env === 'prod';

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

    const webOrigin = origins.S3BucketOrigin.withOriginAccessControl(this.webBucket);

    const viewerProtocolPolicy = cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS;
    const behaviorBase = {
      origin: webOrigin,
      viewerProtocolPolicy,
      responseHeadersPolicy: securityHeadersPolicy,
    };

    this.webDistribution = new cloudfront.Distribution(this, 'WebDistribution', {
      comment: resourceName(config, 'cf', 'web'),
      defaultRootObject: 'index.html',
      priceClass: cloudfront.PriceClass.PRICE_CLASS_200,
      domainNames: config.domainName ? [config.domainName] : undefined,
      defaultBehavior: {
        ...behaviorBase,
        cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED,
      },
      additionalBehaviors: {
        'assets/*': {
          ...behaviorBase,
          cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
        },
        'index.html': {
          ...behaviorBase,
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

    const cloudFrontWebUrl = `https://${this.webDistribution.distributionDomainName}`;

    new ssm.StringParameter(this, 'CloudFrontWebUrlParam', {
      parameterName: `/afro90s/${config.env}/cloudfront-web-url`,
      stringValue: cloudFrontWebUrl,
    });

    new cdk.CfnOutput(this, 'CloudFrontWebUrl', {
      value: cloudFrontWebUrl,
    });
  }
}
