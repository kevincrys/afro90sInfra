import * as cdk from 'aws-cdk-lib';
import { Match, Template } from 'aws-cdk-lib/assertions';
import { devConfig, prodConfig } from '../lib/config';
import { devAccessConfig } from './fixtures/dev-access-config';
import { prodDomainConfig } from './fixtures/prod-domain-config';
import { FrontendStack } from '../lib/stacks/frontend-stack';
import { stackName } from '../lib/stacks/stack-props';

const envFor = (config: typeof devConfig) => ({
  account: config.account,
  region: config.region,
});

describe('FrontendStack', () => {
  test('dev: private S3, CloudFront OAC, SPA errors, assets behavior, SSM, outputs', () => {
    const app = new cdk.App();
    const stack = new FrontendStack(app, stackName(devConfig, 'frontend'), {
      config: devConfig,
      env: envFor(devConfig),
      stackName: stackName(devConfig, 'frontend'),
    });
    const template = Template.fromStack(stack);

    template.hasResourceProperties('AWS::S3::Bucket', {
      BucketName: 'afro90s-dev-s3-web',
      PublicAccessBlockConfiguration: {
        BlockPublicAcls: true,
        BlockPublicPolicy: true,
        IgnorePublicAcls: true,
        RestrictPublicBuckets: true,
      },
      VersioningConfiguration: Match.absent(),
    });

    template.hasResourceProperties('AWS::CloudFront::Distribution', {
      DistributionConfig: Match.objectLike({
        DefaultRootObject: 'index.html',
        PriceClass: 'PriceClass_200',
        Origins: Match.arrayWith([Match.objectLike({ Id: Match.anyValue() })]),
        CacheBehaviors: Match.arrayWith([
          Match.objectLike({
            PathPattern: 'assets/products/*/*',
            ViewerProtocolPolicy: 'redirect-to-https',
            AllowedMethods: ['GET', 'HEAD'],
          }),
          Match.objectLike({
            PathPattern: 'assets/*',
            ViewerProtocolPolicy: 'redirect-to-https',
          }),
        ]),
        CustomErrorResponses: Match.arrayWith([
          Match.objectLike({
            ErrorCode: 403,
            ResponseCode: 200,
            ResponsePagePath: '/index.html',
          }),
        ]),
      }),
    });

    template.resourceCountIs('AWS::CloudFront::Function', 1);

    template.hasResourceProperties('AWS::S3::BucketPolicy', {
      Bucket: 'afro90s-dev-s3-assets',
      PolicyDocument: {
        Statement: Match.arrayWith([
          Match.objectLike({
            Action: 's3:GetObject',
            Effect: 'Allow',
            Principal: { Service: 'cloudfront.amazonaws.com' },
          }),
        ]),
      },
    });

    template.hasResourceProperties('AWS::SSM::Parameter', {
      Name: '/afro90s/dev/cloudfront-web-url',
      Type: 'String',
    });

    template.hasResourceProperties('AWS::SSM::Parameter', {
      Name: '/afro90s/dev/assets-cdn-url',
      Type: 'String',
    });

    template.hasOutput('CloudFrontWebUrl', {
      Value: Match.objectLike({
        'Fn::Join': Match.anyValue(),
      }),
    });

    template.hasOutput('AssetsCdnUrl', {
      Value: Match.objectLike({
        'Fn::Join': Match.anyValue(),
      }),
    });
  });

  test('dev with devAccess: Basic Auth gate on SPA behaviors (task 22)', () => {
    const app = new cdk.App();
    const stack = new FrontendStack(app, stackName(devAccessConfig, 'frontend'), {
      config: devAccessConfig,
      env: envFor(devAccessConfig),
      stackName: stackName(devAccessConfig, 'frontend'),
    });
    const template = Template.fromStack(stack);

    template.resourceCountIs('AWS::CloudFront::Function', 2);

    template.hasResourceProperties('AWS::CloudFront::Function', {
      Name: 'afro90s-dev-cf-dev-access-gate',
      FunctionConfig: Match.objectLike({
        Comment: Match.anyValue(),
      }),
    });

    template.hasResourceProperties('AWS::CloudFront::Distribution', {
      DistributionConfig: Match.objectLike({
        DefaultCacheBehavior: Match.objectLike({
          FunctionAssociations: Match.arrayWith([
            Match.objectLike({
              EventType: 'viewer-request',
              FunctionARN: Match.anyValue(),
            }),
          ]),
        }),
        CacheBehaviors: Match.arrayWith([
          Match.objectLike({
            PathPattern: 'index.html',
            FunctionAssociations: Match.arrayWith([
              Match.objectLike({ EventType: 'viewer-request' }),
            ]),
          }),
        ]),
      }),
    });
  });

  test('prod with custom domain: ACM cert, Route53 alias, www redirect, custom SSM URLs', () => {
    const app = new cdk.App();
    const stack = new FrontendStack(app, stackName(prodDomainConfig, 'frontend'), {
      config: prodDomainConfig,
      env: envFor(prodDomainConfig),
      stackName: stackName(prodDomainConfig, 'frontend'),
    });
    const template = Template.fromStack(stack);

    template.resourceCountIs('AWS::CertificateManager::Certificate', 1);

    template.hasResourceProperties('AWS::CloudFront::Distribution', {
      DistributionConfig: Match.objectLike({
        Aliases: ['afroo90s.com.br', 'www.afroo90s.com.br'],
        DefaultCacheBehavior: Match.objectLike({
          FunctionAssociations: Match.arrayWith([
            Match.objectLike({ EventType: 'viewer-request' }),
          ]),
        }),
      }),
    });

    template.hasResourceProperties('AWS::Route53::RecordSet', {
      Name: 'afroo90s.com.br.',
      Type: 'A',
    });

    template.hasResourceProperties('AWS::Route53::RecordSet', {
      Name: 'www.afroo90s.com.br.',
      Type: 'A',
    });

    template.resourceCountIs('AWS::CloudFront::Function', 2);

    template.hasResourceProperties('AWS::CloudFront::Function', {
      Name: 'afro90s-prod-cf-www-redirect',
      FunctionCode: Match.stringLikeRegexp('www\\.'),
    });

    template.hasResourceProperties('AWS::CloudFront::Function', {
      Name: 'afro90s-prod-cf-strip-assets-prefix',
      FunctionCode: Match.stringLikeRegexp('wwwRedirect'),
    });

    template.hasResourceProperties('AWS::SSM::Parameter', {
      Name: '/afro90s/prod/cloudfront-web-url',
      Value: 'https://afroo90s.com.br',
    });

    template.hasResourceProperties('AWS::SSM::Parameter', {
      Name: '/afro90s/prod/assets-cdn-url',
      Value: 'https://afroo90s.com.br/assets',
    });

    template.hasResourceProperties('AWS::SSM::Parameter', {
      Name: '/afro90s/prod/site-certificate-arn',
      Type: 'String',
    });
  });

  test('prod: no versioning, lifecycle, RETAIN', () => {
    const app = new cdk.App();
    const stack = new FrontendStack(app, stackName(prodConfig, 'frontend'), {
      config: prodConfig,
      env: envFor(prodConfig),
      stackName: stackName(prodConfig, 'frontend'),
    });
    const template = Template.fromStack(stack);

    const buckets = template.findResources('AWS::S3::Bucket', {
      Properties: { BucketName: 'afro90s-prod-s3-web' },
    });

    expect(Object.keys(buckets)).toHaveLength(1);
    const bucket = Object.values(buckets)[0];

    expect(bucket.DeletionPolicy).toBe('Retain');
    expect(bucket.Properties.VersioningConfiguration).toBeUndefined();
    expect(bucket.Properties.LifecycleConfiguration).toEqual({
      Rules: [
        {
          Id: 'AbortIncompleteMultipartUploads',
          Status: 'Enabled',
          AbortIncompleteMultipartUpload: { DaysAfterInitiation: 7 },
        },
      ],
    });
  });
});
