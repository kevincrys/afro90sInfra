import * as cdk from 'aws-cdk-lib';
import { Match, Template } from 'aws-cdk-lib/assertions';
import { devConfig } from '../lib/config';
import { ApiStack } from '../lib/stacks/api-stack';
import { DatabaseStack } from '../lib/stacks/database-stack';
import { stackName } from '../lib/stacks/stack-props';

const envFor = (config: typeof devConfig) => ({
  account: config.account,
  region: config.region,
});

describe('ApiStack — Lambda public IAM role (task 08)', () => {
  test('dev: least-privilege role for products read, orders write, SSM', () => {
    const app = new cdk.App();

    const databaseStack = new DatabaseStack(app, stackName(devConfig, 'database'), {
      config: devConfig,
      env: envFor(devConfig),
      stackName: stackName(devConfig, 'database'),
    });

    const apiStack = new ApiStack(app, stackName(devConfig, 'api'), {
      config: devConfig,
      env: envFor(devConfig),
      stackName: stackName(devConfig, 'api'),
      productsTable: databaseStack.productsTable,
      ordersTable: databaseStack.ordersTable,
    });

    const template = Template.fromStack(apiStack);

    template.hasResourceProperties('AWS::IAM::Role', {
      RoleName: 'afro90s-dev-role-lambda-public',
      AssumeRolePolicyDocument: Match.objectLike({
        Statement: Match.arrayWith([
          Match.objectLike({
            Action: 'sts:AssumeRole',
            Principal: { Service: 'lambda.amazonaws.com' },
          }),
        ]),
      }),
    });

    template.hasResourceProperties('AWS::IAM::Policy', {
      PolicyDocument: Match.objectLike({
        Statement: Match.arrayWith([
          Match.objectLike({
            Action: ['dynamodb:GetItem', 'dynamodb:Query', 'dynamodb:Scan'],
            Resource: Match.arrayWith([
              Match.objectLike({
                'Fn::ImportValue': Match.stringLikeRegexp('database'),
              }),
              Match.objectLike({
                'Fn::Join': Match.anyValue(),
              }),
            ]),
          }),
          Match.objectLike({
            Action: 'dynamodb:PutItem',
            Resource: Match.objectLike({
              'Fn::ImportValue': Match.stringLikeRegexp('database'),
            }),
          }),
          Match.objectLike({
            Action: 'ssm:GetParameter',
            Resource: 'arn:aws:ssm:us-east-1:083171867610:parameter/afro90s/dev/*',
          }),
        ]),
      }),
    });

    const policies = template.findResources('AWS::IAM::Policy');
    for (const policy of Object.values(policies)) {
      const statements = policy.Properties.PolicyDocument.Statement as Array<{
        Action?: string | string[];
        Resource?: string | string[];
      }>;
      for (const statement of statements) {
        const resources = Array.isArray(statement.Resource)
          ? statement.Resource
          : [statement.Resource];
        expect(resources).not.toContain('*');
        const actions = Array.isArray(statement.Action)
          ? statement.Action
          : [statement.Action];
        for (const action of actions) {
          expect(action).not.toMatch(/^ses:/i);
        }
      }
    }

    template.hasOutput('LambdaPublicRoleArn', {
      Value: Match.objectLike({
        'Fn::GetAtt': Match.anyValue(),
      }),
    });
  });
});
