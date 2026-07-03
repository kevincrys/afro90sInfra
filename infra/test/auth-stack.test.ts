import * as cdk from 'aws-cdk-lib';
import { Match, Template } from 'aws-cdk-lib/assertions';
import { devConfig, prodConfig } from '../lib/config';
import { AuthStack } from '../lib/stacks/auth-stack';
import { stackName } from '../lib/stacks/stack-props';

const envFor = (config: typeof devConfig) => ({
  account: config.account,
  region: config.region,
});

describe('AuthStack — Cognito admins (task 13)', () => {
  test('dev: User Pool, SPA client, admins group, SSM, outputs', () => {
    const app = new cdk.App();
    const stack = new AuthStack(app, stackName(devConfig, 'auth'), {
      config: devConfig,
      env: envFor(devConfig),
      stackName: stackName(devConfig, 'auth'),
    });
    const template = Template.fromStack(stack);

    template.hasResourceProperties('AWS::Cognito::UserPool', {
      UserPoolName: 'afro90s-dev-cognito-admins',
      AdminCreateUserConfig: Match.objectLike({
        AllowAdminCreateUserOnly: true,
      }),
      MfaConfiguration: 'OFF',
    });

    template.hasResourceProperties('AWS::Cognito::UserPoolClient', {
      ClientName: 'afro90s-dev-cognito-admins-spa',
      GenerateSecret: false,
      PreventUserExistenceErrors: 'ENABLED',
      ExplicitAuthFlows: Match.arrayWith(['ALLOW_USER_SRP_AUTH']),
    });

    template.hasResourceProperties('AWS::Cognito::UserPoolGroup', {
      GroupName: 'admins',
    });

    template.hasResourceProperties('AWS::SSM::Parameter', {
      Name: '/afro90s/dev/cognito-user-pool-id',
    });
    template.hasResourceProperties('AWS::SSM::Parameter', {
      Name: '/afro90s/dev/cognito-client-id',
    });
    template.hasResourceProperties('AWS::SSM::Parameter', {
      Name: '/afro90s/dev/cognito-region',
      Value: 'us-east-1',
    });

    template.hasOutput('CognitoUserPoolId', {
      Export: { Name: 'afro90s-dev-CognitoUserPoolId' },
    });
    template.hasOutput('CognitoClientId', {
      Export: { Name: 'afro90s-dev-CognitoClientId' },
    });
    template.hasOutput('CognitoRegion', {
      Export: { Name: 'afro90s-dev-CognitoRegion' },
    });
  });

  test('prod: RETAIN on User Pool', () => {
    const app = new cdk.App();
    const stack = new AuthStack(app, stackName(prodConfig, 'auth'), {
      config: prodConfig,
      env: envFor(prodConfig),
      stackName: stackName(prodConfig, 'auth'),
    });
    const template = Template.fromStack(stack);

    const pools = template.findResources('AWS::Cognito::UserPool', {
      Properties: { UserPoolName: 'afro90s-prod-cognito-admins' },
    });
    expect(Object.keys(pools)).toHaveLength(1);
    const pool = Object.values(pools)[0];
    expect(pool.DeletionPolicy).toBe('Retain');
    expect(pool.UpdateReplacePolicy).toBe('Retain');
  });
});
