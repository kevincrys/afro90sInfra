import * as iam from 'aws-cdk-lib/aws-iam';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';
import { AppConfig } from '../config';
import { resourceName } from './naming';

export interface LambdaPublicRoleProps {
  config: AppConfig;
  productsTable: dynamodb.ITable;
  ordersTable: dynamodb.ITable;
}

export class LambdaPublicRole extends Construct {
  public readonly role: iam.Role;

  constructor(scope: Construct, id: string, props: LambdaPublicRoleProps) {
    super(scope, id);

    const { config, productsTable, ordersTable } = props;

    this.role = new iam.Role(this, 'Role', {
      roleName: resourceName(config, 'role', 'lambda-public'),
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      description: 'Execution role for public API Lambda (products read, orders write)',
    });

    this.role.addToPolicy(
      new iam.PolicyStatement({
        actions: ['dynamodb:GetItem', 'dynamodb:Query', 'dynamodb:Scan'],
        resources: [productsTable.tableArn, `${productsTable.tableArn}/index/*`],
      }),
    );

    this.role.addToPolicy(
      new iam.PolicyStatement({
        actions: ['dynamodb:PutItem'],
        resources: [ordersTable.tableArn],
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
  }
}
