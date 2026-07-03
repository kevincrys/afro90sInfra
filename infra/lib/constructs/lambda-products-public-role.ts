import * as iam from 'aws-cdk-lib/aws-iam';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';
import { AppConfig } from '../config';
import { resourceName } from './naming';

export interface LambdaProductsPublicRoleProps {
  config: AppConfig;
  productsTable: dynamodb.ITable;
}

export class LambdaProductsPublicRole extends Construct {
  public readonly role: iam.Role;

  constructor(scope: Construct, id: string, props: LambdaProductsPublicRoleProps) {
    super(scope, id);

    const { config, productsTable } = props;

    this.role = new iam.Role(this, 'Role', {
      roleName: resourceName(config, 'role', 'lambda-products-public'),
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      description: 'Products catalog read (GET /products)',
    });

    this.role.addToPolicy(
      new iam.PolicyStatement({
        actions: ['dynamodb:GetItem', 'dynamodb:Query', 'dynamodb:Scan'],
        resources: [productsTable.tableArn, `${productsTable.tableArn}/index/*`],
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
