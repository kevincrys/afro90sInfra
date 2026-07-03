import * as cdk from 'aws-cdk-lib';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import { Construct } from 'constructs';
import { resourceName } from '../constructs/naming';
import { Afro90sStackProps, cfnExportName } from './stack-props';

export class AuthStack extends cdk.Stack {
  public readonly userPool: cognito.UserPool;
  public readonly userPoolClient: cognito.UserPoolClient;

  constructor(scope: Construct, id: string, props: Afro90sStackProps) {
    super(scope, id, props);

    const { config } = props;
    const isProd = config.env === 'prod';
    const poolName = resourceName(config, 'cognito', 'admins');

    this.userPool = new cognito.UserPool(this, 'AdminsUserPool', {
      userPoolName: poolName,
      selfSignUpEnabled: false,
      mfa: cognito.Mfa.OFF,
      removalPolicy: isProd ? cdk.RemovalPolicy.RETAIN : cdk.RemovalPolicy.DESTROY,
    });

    new cognito.CfnUserPoolGroup(this, 'AdminsGroup', {
      userPoolId: this.userPool.userPoolId,
      groupName: 'admins',
      description: 'Administradores Afro90s (v1 único grupo)',
    });

    this.userPoolClient = this.userPool.addClient('SpaClient', {
      userPoolClientName: `${poolName}-spa`,
      generateSecret: false,
      authFlows: {
        userSrp: true,
      },
      preventUserExistenceErrors: true,
    });

    new ssm.StringParameter(this, 'CognitoUserPoolIdParam', {
      parameterName: `/afro90s/${config.env}/cognito-user-pool-id`,
      stringValue: this.userPool.userPoolId,
    });

    new ssm.StringParameter(this, 'CognitoClientIdParam', {
      parameterName: `/afro90s/${config.env}/cognito-client-id`,
      stringValue: this.userPoolClient.userPoolClientId,
    });

    new ssm.StringParameter(this, 'CognitoRegionParam', {
      parameterName: `/afro90s/${config.env}/cognito-region`,
      stringValue: config.region,
    });

    new cdk.CfnOutput(this, 'CognitoUserPoolId', {
      value: this.userPool.userPoolId,
      exportName: cfnExportName(config, 'CognitoUserPoolId'),
    });

    new cdk.CfnOutput(this, 'CognitoClientId', {
      value: this.userPoolClient.userPoolClientId,
      exportName: cfnExportName(config, 'CognitoClientId'),
    });

    new cdk.CfnOutput(this, 'CognitoRegion', {
      value: config.region,
      exportName: cfnExportName(config, 'CognitoRegion'),
    });
  }
}
