import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { FoundationStack } from '../lib/stacks/foundation-stack';

test('Foundation stack synth with tags and output', () => {
  const app = new cdk.App();
  const stack = new FoundationStack(app, 'TestFoundation', {
    envName: 'dev',
    env: { account: '083171867610', region: 'us-east-1' },
  });

  const template = Template.fromStack(stack);
  template.hasOutput('Environment', { Value: 'dev' });
});
