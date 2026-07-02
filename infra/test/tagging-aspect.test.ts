import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Template } from 'aws-cdk-lib/assertions';
import { TaggingAspect } from '../lib/constructs/tagging-aspect';

describe('TaggingAspect', () => {
  test('applies required tags to taggable resources', () => {
    const app = new cdk.App();

    const stack = new cdk.Stack(app, 'TestTags', {
      env: { account: '083171867610', region: 'us-east-1' },
    });
    new s3.Bucket(stack, 'Probe');

    cdk.Aspects.of(app).add(new TaggingAspect('dev'));

    const template = Template.fromStack(stack);
    const buckets = template.findResources('AWS::S3::Bucket');
    const tags = Object.values(buckets)[0].Properties.Tags as Array<{ Key: string; Value: string }>;

    expect(tags).toEqual(
      expect.arrayContaining([
        { Key: 'project', Value: 'afro90s' },
        { Key: 'env', Value: 'dev' },
        { Key: 'managed-by', Value: 'afro90sInfra' },
      ]),
    );
  });
});
