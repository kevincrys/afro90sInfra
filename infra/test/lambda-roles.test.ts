import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Template } from 'aws-cdk-lib/assertions';
import { devConfig } from '../lib/config';
import { LambdaAdminRole } from '../lib/constructs/lambda-admin-role';
import { LambdaOrdersPublicRole } from '../lib/constructs/lambda-orders-public-role';
import { LambdaProductsPublicRole } from '../lib/constructs/lambda-products-public-role';

function collectPolicyStatements(template: Template): Array<{
  Action?: string | string[];
  Resource?: unknown;
}> {
  const policies = template.findResources('AWS::IAM::Policy');
  const statements: Array<{ Action?: string | string[]; Resource?: unknown }> = [];

  for (const policy of Object.values(policies)) {
    const policyStatements = policy.Properties.PolicyDocument.Statement as Array<{
      Action?: string | string[];
      Resource?: unknown;
    }>;
    statements.push(...policyStatements);
  }

  return statements;
}

function hasActionsInStatement(
  statements: Array<{ Action?: string | string[]; Resource?: unknown }>,
  actions: string[],
): boolean {
  return statements.some((statement) => {
    const statementActions = Array.isArray(statement.Action)
      ? statement.Action
      : [statement.Action ?? ''];
    return actions.every((action) => statementActions.includes(action));
  });
}

function createTables(stack: cdk.Stack) {
  const productsTable = new dynamodb.Table(stack, 'ProductsTable', {
    tableName: 'afro90s-dev-ddb-products',
    partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
    billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
  });

  const ordersTable = new dynamodb.Table(stack, 'OrdersTable', {
    tableName: 'afro90s-dev-ddb-orders',
    partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
    billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
  });

  return { productsTable, ordersTable };
}

describe('Lambda IAM roles — DynamoDB permissions', () => {
  test('admin role: products CRUD + orders read/update including Scan', () => {
    const app = new cdk.App();
    const stack = new cdk.Stack(app, 'AdminRoleStack');
    const { productsTable, ordersTable } = createTables(stack);
    const assetsBucket = new s3.Bucket(stack, 'AssetsBucket', {
      bucketName: 'afro90s-dev-s3-assets',
    });

    new LambdaAdminRole(stack, 'AdminRole', {
      config: devConfig,
      productsTable,
      ordersTable,
      assetsBucket,
    });

    const templateJson = JSON.stringify(Template.fromStack(stack).toJSON());
    const statements = collectPolicyStatements(Template.fromStack(stack));

    expect(
      hasActionsInStatement(statements, [
        'dynamodb:GetItem',
        'dynamodb:PutItem',
        'dynamodb:UpdateItem',
        'dynamodb:DeleteItem',
        'dynamodb:Query',
        'dynamodb:Scan',
      ]),
    ).toBe(true);

    expect(
      hasActionsInStatement(statements, [
        'dynamodb:GetItem',
        'dynamodb:Query',
        'dynamodb:Scan',
        'dynamodb:UpdateItem',
      ]),
    ).toBe(true);

    expect(templateJson).toContain('afro90s-dev-ddb-orders');
    expect(templateJson).toContain('dynamodb:Scan');
  });

  test('products-public role: products read only', () => {
    const app = new cdk.App();
    const stack = new cdk.Stack(app, 'ProductsPublicRoleStack');
    const { productsTable } = createTables(stack);

    new LambdaProductsPublicRole(stack, 'ProductsPublicRole', {
      config: devConfig,
      productsTable,
    });

    const statements = collectPolicyStatements(Template.fromStack(stack));

    expect(
      hasActionsInStatement(statements, ['dynamodb:GetItem', 'dynamodb:Query', 'dynamodb:Scan']),
    ).toBe(true);

    expect(
      hasActionsInStatement(statements, ['dynamodb:PutItem', 'dynamodb:UpdateItem', 'dynamodb:DeleteItem']),
    ).toBe(false);
  });

  test('orders-public role: products read + orders PutItem', () => {
    const app = new cdk.App();
    const stack = new cdk.Stack(app, 'OrdersPublicRoleStack');
    const { productsTable, ordersTable } = createTables(stack);

    new LambdaOrdersPublicRole(stack, 'OrdersPublicRole', {
      config: devConfig,
      productsTable,
      ordersTable,
    });

    const statements = collectPolicyStatements(Template.fromStack(stack));

    expect(
      hasActionsInStatement(statements, ['dynamodb:GetItem', 'dynamodb:Query', 'dynamodb:Scan']),
    ).toBe(true);

    expect(hasActionsInStatement(statements, ['dynamodb:PutItem'])).toBe(true);

    expect(hasActionsInStatement(statements, ['dynamodb:UpdateItem', 'dynamodb:DeleteItem'])).toBe(
      false,
    );
  });
});
