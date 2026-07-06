import * as cdk from 'aws-cdk-lib';
import { Match, Template } from 'aws-cdk-lib/assertions';
import { devConfig } from '../lib/config';
import { prodDomainConfig } from './fixtures/prod-domain-config';
import { ApiStack } from '../lib/stacks/api-stack';
import { DatabaseStack } from '../lib/stacks/database-stack';
import { FrontendStack } from '../lib/stacks/frontend-stack';
import { StorageStack } from '../lib/stacks/storage-stack';
import { stackName } from '../lib/stacks/stack-props';

const envFor = (config: typeof devConfig) => ({
  account: config.account,
  region: config.region,
});

describe('ApiStack — four flow Lambdas (task 10)', () => {
  test('dev: HTTP API, 4 Lambdas, split IAM roles, routes, SSM, outputs', () => {
    const app = new cdk.App();

    const databaseStack = new DatabaseStack(app, stackName(devConfig, 'database'), {
      config: devConfig,
      env: envFor(devConfig),
      stackName: stackName(devConfig, 'database'),
    });

    const storageStack = new StorageStack(app, stackName(devConfig, 'storage'), {
      config: devConfig,
      env: envFor(devConfig),
      stackName: stackName(devConfig, 'storage'),
    });

    const apiStack = new ApiStack(app, stackName(devConfig, 'api'), {
      config: devConfig,
      env: envFor(devConfig),
      stackName: stackName(devConfig, 'api'),
      productsTable: databaseStack.productsTable,
      ordersTable: databaseStack.ordersTable,
      assetsBucket: storageStack.assetsBucket,
      siteCertificate: undefined,
    });

    const template = Template.fromStack(apiStack);

    for (const flow of [
      'products-public',
      'orders-public',
      'products-admin',
      'orders-admin',
    ]) {
      template.hasResourceProperties('AWS::Lambda::Function', {
        FunctionName: `afro90s-dev-lambda-${flow}`,
        Runtime: 'nodejs24.x',
        Handler: 'handler.handler',
        MemorySize: 256,
        Timeout: 29,
      });
    }

    template.hasResourceProperties('AWS::IAM::Role', {
      RoleName: 'afro90s-dev-role-lambda-products-public',
    });

    template.hasResourceProperties('AWS::IAM::Role', {
      RoleName: 'afro90s-dev-role-lambda-orders-public',
    });

    template.hasResourceProperties('AWS::IAM::Role', {
      RoleName: 'afro90s-dev-role-lambda-admin',
    });

    const policies = template.findResources('AWS::IAM::Policy');
    for (const policy of Object.values(policies)) {
      const statements = policy.Properties.PolicyDocument.Statement as Array<{
        Action?: string | string[];
        Resource?: string | string[];
      }>;
      for (const statement of statements) {
        const resources = Array.isArray(statement.Resource)
          ? statement.Resource
          : [statement.Resource];
        expect(resources).not.toContain('*');
        const actions = Array.isArray(statement.Action)
          ? statement.Action
          : [statement.Action];
        for (const action of actions) {
          expect(action).not.toMatch(/^ses:/i);
        }
      }
    }

    template.hasResourceProperties('AWS::ApiGatewayV2::Api', {
      Name: 'afro90s-dev-apigw-api',
      ProtocolType: 'HTTP',
    });

    template.resourceCountIs('AWS::ApiGatewayV2::Route', 11);

    template.hasResourceProperties('AWS::ApiGatewayV2::Route', {
      RouteKey: 'GET /admin/products',
      AuthorizationType: 'JWT',
    });

    template.hasResourceProperties('AWS::ApiGatewayV2::Route', {
      RouteKey: 'GET /admin/orders',
      AuthorizationType: 'JWT',
    });

    template.hasResourceProperties('AWS::ApiGatewayV2::Route', {
      RouteKey: 'GET /products',
      AuthorizationType: 'NONE',
    });

    template.hasResourceProperties('AWS::SSM::Parameter', {
      Name: '/afro90s/dev/lambda-products-public-name',
    });
    template.hasResourceProperties('AWS::SSM::Parameter', {
      Name: '/afro90s/dev/lambda-orders-public-name',
    });
    template.hasResourceProperties('AWS::SSM::Parameter', {
      Name: '/afro90s/dev/lambda-products-admin-name',
    });
    template.hasResourceProperties('AWS::SSM::Parameter', {
      Name: '/afro90s/dev/lambda-orders-admin-name',
    });

    template.hasOutput('LambdaProductsPublicFunctionName', {
      Export: { Name: 'afro90s-dev-LambdaProductsPublicFunctionName' },
    });
    template.hasOutput('LambdaOrdersPublicFunctionName', {
      Export: { Name: 'afro90s-dev-LambdaOrdersPublicFunctionName' },
    });

    expect(apiStack.cognitoAuthorizer).toBeDefined();
  });

  test('prod with custom domain: API domain, mapping, CORS origin, Lambda env', () => {
    const app = new cdk.App();

    const databaseStack = new DatabaseStack(app, stackName(prodDomainConfig, 'database'), {
      config: prodDomainConfig,
      env: envFor(prodDomainConfig),
      stackName: stackName(prodDomainConfig, 'database'),
    });

    const storageStack = new StorageStack(app, stackName(prodDomainConfig, 'storage'), {
      config: prodDomainConfig,
      env: envFor(prodDomainConfig),
      stackName: stackName(prodDomainConfig, 'storage'),
    });

    const frontendStack = new FrontendStack(app, stackName(prodDomainConfig, 'frontend'), {
      config: prodDomainConfig,
      env: envFor(prodDomainConfig),
      stackName: stackName(prodDomainConfig, 'frontend'),
    });
    frontendStack.addDependency(storageStack);

    const apiStack = new ApiStack(app, stackName(prodDomainConfig, 'api'), {
      config: prodDomainConfig,
      env: envFor(prodDomainConfig),
      stackName: stackName(prodDomainConfig, 'api'),
      productsTable: databaseStack.productsTable,
      ordersTable: databaseStack.ordersTable,
      assetsBucket: storageStack.assetsBucket,
      siteCertificate: frontendStack.siteCertificate,
    });
    apiStack.addDependency(frontendStack);

    const template = Template.fromStack(apiStack);

    template.hasResourceProperties('AWS::ApiGatewayV2::DomainName', {
      DomainName: 'api.afroo90s.com.br',
    });

    template.hasResourceProperties('AWS::ApiGatewayV2::ApiMapping', {
      Stage: 'prod',
    });

    template.hasResourceProperties('AWS::Route53::RecordSet', {
      Name: 'api.afroo90s.com.br.',
      Type: 'A',
    });

    template.hasResourceProperties('AWS::ApiGatewayV2::Api', {
      CorsConfiguration: Match.objectLike({
        AllowOrigins: ['https://afroo90s.com.br'],
      }),
    });

    template.hasResourceProperties('AWS::Lambda::Function', {
      FunctionName: 'afro90s-prod-lambda-products-public',
      Environment: {
        Variables: Match.objectLike({
          CLOUDFRONT_WEB_URL: 'https://afroo90s.com.br',
        }),
      },
    });

    template.hasResourceProperties('AWS::SSM::Parameter', {
      Name: '/afro90s/prod/api-base-url',
      Value: 'https://api.afroo90s.com.br',
    });
  });
});
