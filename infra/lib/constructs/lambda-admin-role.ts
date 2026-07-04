import * as iam from 'aws-cdk-lib/aws-iam';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';
import { AppConfig } from '../config';
import { resourceName } from './naming';

export interface LambdaAdminRoleProps {
  config: AppConfig;
  productsTable: dynamodb.ITable;
  ordersTable: dynamodb.ITable;
  assetsBucket: s3.IBucket;
}

/** Shared admin execution role for products-admin and orders-admin Lambdas (task 15). */
export class LambdaAdminRole extends Construct {
  public readonly role: iam.Role;

  constructor(scope: Construct, id: string, props: LambdaAdminRoleProps) {
    super(scope, id);

    const { config, productsTable, ordersTable, assetsBucket } = props;

    this.role = new iam.Role(this, 'Role', {
      roleName: resourceName(config, 'role', 'lambda-admin'),
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      description: 'Admin flows: products CRUD + S3 assets, orders read/update',
    });

    this.role.addToPolicy(
      new iam.PolicyStatement({
        actions: [
          'dynamodb:GetItem',
          'dynamodb:PutItem',
          'dynamodb:UpdateItem',
          'dynamodb:DeleteItem',
          'dynamodb:Query',
          'dynamodb:Scan',
        ],
        resources: [productsTable.tableArn, `${productsTable.tableArn}/index/*`],
      }),
    );

    this.role.addToPolicy(
      new iam.PolicyStatement({
        actions: ['dynamodb:GetItem', 'dynamodb:Query', 'dynamodb:Scan', 'dynamodb:UpdateItem'],
        resources: [ordersTable.tableArn, `${ordersTable.tableArn}/index/*`],
      }),
    );

    this.role.addToPolicy(
      new iam.PolicyStatement({
        actions: ['s3:PutObject', 's3:DeleteObject'],
        resources: [`${assetsBucket.bucketArn}/products/*`],
      }),
    );

    this.role.addToPolicy(
      new iam.PolicyStatement({
        actions: ['ssm:GetParameter'],
        resources: [
          `arn:aws:ssm:${config.region}:${config.account}:parameter/afro90s/${config.env}/*`,
        ],
      }),
    );

    this.role.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'),
    );
  }
}
