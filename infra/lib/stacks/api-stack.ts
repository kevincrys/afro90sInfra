import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';
import { LambdaPublicRole } from '../constructs/lambda-public-role';
import { Afro90sStackProps } from './stack-props';

export interface ApiStackProps extends Afro90sStackProps {
  productsTable: dynamodb.ITable;
  ordersTable: dynamodb.ITable;
}

export class ApiStack extends cdk.Stack {
  public readonly lambdaPublicRole: LambdaPublicRole;

  constructor(scope: Construct, id: string, props: ApiStackProps) {
    super(scope, id, props);

    this.lambdaPublicRole = new LambdaPublicRole(this, 'LambdaPublicRole', {
      config: props.config,
      productsTable: props.productsTable,
      ordersTable: props.ordersTable,
    });

    new cdk.CfnOutput(this, 'LambdaPublicRoleArn', {
      value: this.lambdaPublicRole.role.roleArn,
    });
  }
}
