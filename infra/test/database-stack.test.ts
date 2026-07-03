import * as cdk from 'aws-cdk-lib';
import { Match, Template } from 'aws-cdk-lib/assertions';
import { devConfig, prodConfig } from '../lib/config';
import { DatabaseStack } from '../lib/stacks/database-stack';
import { stackName } from '../lib/stacks/stack-props';

const envFor = (config: typeof devConfig) => ({
  account: config.account,
  region: config.region,
});

describe('DatabaseStack', () => {
  test('dev: on-demand tables, GSIs, SSM, outputs; PITR disabled on orders', () => {
    const app = new cdk.App();
    const stack = new DatabaseStack(app, stackName(devConfig, 'database'), {
      config: devConfig,
      env: envFor(devConfig),
      stackName: stackName(devConfig, 'database'),
    });
    const template = Template.fromStack(stack);

    template.resourceCountIs('AWS::DynamoDB::Table', 2);

    template.hasResourceProperties('AWS::DynamoDB::Table', {
      TableName: 'afro90s-dev-ddb-products',
      BillingMode: 'PAY_PER_REQUEST',
      DeletionProtectionEnabled: false,
      GlobalSecondaryIndexes: Match.arrayWith([
        Match.objectLike({
          IndexName: 'gsi-createdAt',
          KeySchema: [{ AttributeName: 'createdAt', KeyType: 'HASH' }],
        }),
      ]),
    });

    template.hasResourceProperties('AWS::DynamoDB::Table', {
      TableName: 'afro90s-dev-ddb-orders',
      BillingMode: 'PAY_PER_REQUEST',
      DeletionProtectionEnabled: false,
      TimeToLiveSpecification: {
        AttributeName: 'expiresAt',
        Enabled: true,
      },
      PointInTimeRecoverySpecification: {
        PointInTimeRecoveryEnabled: false,
      },
      GlobalSecondaryIndexes: Match.arrayWith([
        Match.objectLike({
          IndexName: 'gsi-status-createdAt',
          KeySchema: [
            { AttributeName: 'status', KeyType: 'HASH' },
            { AttributeName: 'createdAt', KeyType: 'RANGE' },
          ],
        }),
      ]),
    });

    template.hasResourceProperties('AWS::SSM::Parameter', {
      Name: '/afro90s/dev/products-table-name',
      Type: 'String',
    });

    template.hasResourceProperties('AWS::SSM::Parameter', {
      Name: '/afro90s/dev/orders-table-name',
      Type: 'String',
    });

    template.hasOutput('ProductsTableName', {
      Value: { Ref: Match.stringLikeRegexp('ProductsTable') },
    });

    template.hasOutput('OrdersTableName', {
      Value: { Ref: Match.stringLikeRegexp('OrdersTable') },
    });
  });

  test('prod: RETAIN, deletion protection, PITR on orders only', () => {
    const app = new cdk.App();
    const stack = new DatabaseStack(app, stackName(prodConfig, 'database'), {
      config: prodConfig,
      env: envFor(prodConfig),
      stackName: stackName(prodConfig, 'database'),
    });
    const template = Template.fromStack(stack);

    const products = template.findResources('AWS::DynamoDB::Table', {
      Properties: { TableName: 'afro90s-prod-ddb-products' },
    });
    const orders = template.findResources('AWS::DynamoDB::Table', {
      Properties: { TableName: 'afro90s-prod-ddb-orders' },
    });

    expect(Object.keys(products)).toHaveLength(1);
    expect(Object.keys(orders)).toHaveLength(1);

    const productsResource = Object.values(products)[0];
    const ordersResource = Object.values(orders)[0];

    expect(productsResource.DeletionPolicy).toBe('Retain');
    expect(productsResource.UpdateReplacePolicy).toBe('Retain');
    expect(productsResource.Properties.BillingMode).toBe('PAY_PER_REQUEST');
    expect(productsResource.Properties.DeletionProtectionEnabled).toBe(true);
    expect(productsResource.Properties.PointInTimeRecoverySpecification).toBeUndefined();

    expect(ordersResource.DeletionPolicy).toBe('Retain');
    expect(ordersResource.UpdateReplacePolicy).toBe('Retain');
    expect(ordersResource.Properties.BillingMode).toBe('PAY_PER_REQUEST');
    expect(ordersResource.Properties.DeletionProtectionEnabled).toBe(true);
    expect(ordersResource.Properties.TimeToLiveSpecification).toEqual({
      AttributeName: 'expiresAt',
      Enabled: true,
    });
    expect(ordersResource.Properties.PointInTimeRecoverySpecification).toEqual({
      PointInTimeRecoveryEnabled: true,
    });
  });
});
