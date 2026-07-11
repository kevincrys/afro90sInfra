import * as iam from 'aws-cdk-lib/aws-iam';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';
import { AppConfig, isSesEnabled } from '../config';
import { resourceName } from './naming';

export interface LambdaOrdersPublicRoleProps {
  config: AppConfig;
  productsTable: dynamodb.ITable;
  ordersTable: dynamodb.ITable;
}

export class LambdaOrdersPublicRole extends Construct {
  public readonly role: iam.Role;

  constructor(scope: Construct, id: string, props: LambdaOrdersPublicRoleProps) {
    super(scope, id);

    const { config, productsTable, ordersTable } = props;

    this.role = new iam.Role(this, 'Role', {
      roleName: resourceName(config, 'role', 'lambda-orders-public'),
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      description: 'Order creation (POST /orders) with products read for validation',
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

    if (isSesEnabled(config)) {
      const fromEmail = config.ses!.fromEmail;
      const adminEmail = config.ses!.adminNotificationEmail;
      const fromDomain = fromEmail.includes('@') ? fromEmail.split('@')[1]! : fromEmail;
      // Sandbox (and some SES checks) authorize Source and Destination identities.
      const identityArns = Array.from(
        new Set([
          `arn:aws:ses:${config.region}:${config.account}:identity/${fromEmail}`,
          `arn:aws:ses:${config.region}:${config.account}:identity/${fromDomain}`,
          `arn:aws:ses:${config.region}:${config.account}:identity/${adminEmail}`,
        ]),
      );

      this.role.addToPolicy(
        new iam.PolicyStatement({
          actions: ['ses:SendTemplatedEmail'],
          resources: [
            ...identityArns,
            `arn:aws:ses:${config.region}:${config.account}:template/afro90s-${config.env}-ses-new-order`,
          ],
        }),
      );
    }

    this.role.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'),
    );
  }
}
