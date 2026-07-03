import * as cdk from 'aws-cdk-lib';
import { Match, Template } from 'aws-cdk-lib/assertions';
import { devConfig, prodConfig } from '../lib/config';
import { StorageStack } from '../lib/stacks/storage-stack';
import { stackName } from '../lib/stacks/stack-props';

const envFor = (config: typeof devConfig) => ({
  account: config.account,
  region: config.region,
});

describe('StorageStack', () => {
  test('dev: private assets bucket, SSM, output', () => {
    const app = new cdk.App();
    const stack = new StorageStack(app, stackName(devConfig, 'storage'), {
      config: devConfig,
      env: envFor(devConfig),
      stackName: stackName(devConfig, 'storage'),
    });
    const template = Template.fromStack(stack);

    template.hasResourceProperties('AWS::S3::Bucket', {
      BucketName: 'afro90s-dev-s3-assets',
      PublicAccessBlockConfiguration: {
        BlockPublicAcls: true,
        BlockPublicPolicy: true,
        IgnorePublicAcls: true,
        RestrictPublicBuckets: true,
      },
      BucketEncryption: {
        ServerSideEncryptionConfiguration: [
          {
            ServerSideEncryptionByDefault: {
              SSEAlgorithm: 'AES256',
            },
          },
        ],
      },
      VersioningConfiguration: Match.absent(),
    });

    template.hasResourceProperties('AWS::SSM::Parameter', {
      Name: '/afro90s/dev/assets-bucket-name',
      Type: 'String',
    });

    template.hasResourceProperties('AWS::SSM::Parameter', {
      Name: '/afro90s/dev/assets-bucket-arn',
      Type: 'String',
    });

    template.hasOutput('AssetsBucketName', {
      Value: { Ref: Match.stringLikeRegexp('AssetsBucket') },
    });
  });

  test('prod: RETAIN, no versioning', () => {
    const app = new cdk.App();
    const stack = new StorageStack(app, stackName(prodConfig, 'storage'), {
      config: prodConfig,
      env: envFor(prodConfig),
      stackName: stackName(prodConfig, 'storage'),
    });
    const template = Template.fromStack(stack);

    const buckets = template.findResources('AWS::S3::Bucket', {
      Properties: { BucketName: 'afro90s-prod-s3-assets' },
    });

    expect(Object.keys(buckets)).toHaveLength(1);
    expect(Object.values(buckets)[0].DeletionPolicy).toBe('Retain');
  });
});
