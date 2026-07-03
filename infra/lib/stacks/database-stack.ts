import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import { Construct } from 'constructs';
import { resourceName } from '../constructs/naming';
import { Afro90sStackProps, cfnExportName } from './stack-props';

export class DatabaseStack extends cdk.Stack {
  public readonly productsTable: dynamodb.Table;
  public readonly ordersTable: dynamodb.Table;

  constructor(scope: Construct, id: string, props: Afro90sStackProps) {
    super(scope, id, props);

    const { config } = props;
    const isProd = config.env === 'prod';

    this.productsTable = new dynamodb.Table(this, 'ProductsTable', {
      tableName: resourceName(config, 'ddb', 'products'),
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: isProd ? cdk.RemovalPolicy.RETAIN : cdk.RemovalPolicy.DESTROY,
      deletionProtection: isProd,
    });

    this.productsTable.addGlobalSecondaryIndex({
      indexName: 'gsi-createdAt',
      partitionKey: { name: 'createdAt', type: dynamodb.AttributeType.STRING },
    });

    this.ordersTable = new dynamodb.Table(this, 'OrdersTable', {
      tableName: resourceName(config, 'ddb', 'orders'),
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: isProd ? cdk.RemovalPolicy.RETAIN : cdk.RemovalPolicy.DESTROY,
      deletionProtection: isProd,
      pointInTimeRecoverySpecification: {
        pointInTimeRecoveryEnabled: isProd,
      },
      timeToLiveAttribute: 'expiresAt',
    });

    this.ordersTable.addGlobalSecondaryIndex({
      indexName: 'gsi-status-createdAt',
      partitionKey: { name: 'status', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'createdAt', type: dynamodb.AttributeType.STRING },
    });

    new ssm.StringParameter(this, 'ProductsTableNameParam', {
      parameterName: `/afro90s/${config.env}/products-table-name`,
      stringValue: this.productsTable.tableName,
    });

    new ssm.StringParameter(this, 'OrdersTableNameParam', {
      parameterName: `/afro90s/${config.env}/orders-table-name`,
      stringValue: this.ordersTable.tableName,
    });

    new cdk.CfnOutput(this, 'ProductsTableName', {
      value: this.productsTable.tableName,
      exportName: cfnExportName(config, 'ProductsTableName'),
    });

    new cdk.CfnOutput(this, 'OrdersTableName', {
      value: this.ordersTable.tableName,
      exportName: cfnExportName(config, 'OrdersTableName'),
    });
  }
}
