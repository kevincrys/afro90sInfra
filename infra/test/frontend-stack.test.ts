import * as cdk from 'aws-cdk-lib';
import { Match, Template } from 'aws-cdk-lib/assertions';
import { devConfig, prodConfig } from '../lib/config';
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
            PathPattern: 'assets/products/*',
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
