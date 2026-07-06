import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { devConfig } from '../lib/config';
import { prodDomainConfig } from './fixtures/prod-domain-config';
import { ApiStack } from '../lib/stacks/api-stack';
import { AuthStack } from '../lib/stacks/auth-stack';
import { DatabaseStack } from '../lib/stacks/database-stack';
import { FrontendStack } from '../lib/stacks/frontend-stack';
import { stackName } from '../lib/stacks/stack-props';
import { StorageStack } from '../lib/stacks/storage-stack';

const env = { account: devConfig.account, region: devConfig.region };
const baseProps = { config: devConfig, env };

function synthStacks(config: typeof devConfig) {
  const app = new cdk.App();
  const stackEnv = { account: config.account, region: config.region };
  const props = { config, env: stackEnv };

  const databaseStack = new DatabaseStack(app, stackName(config, 'database'), {
    ...props,
    stackName: stackName(config, 'database'),
  });
  const authStack = new AuthStack(app, stackName(config, 'auth'), {
    ...props,
    stackName: stackName(config, 'auth'),
  });
  const storageStack = new StorageStack(app, stackName(config, 'storage'), {
    ...props,
    stackName: stackName(config, 'storage'),
  });

  const frontendStack = new FrontendStack(app, stackName(config, 'frontend'), {
    ...props,
    stackName: stackName(config, 'frontend'),
  });
  frontendStack.addDependency(storageStack);

  const apiStack = new ApiStack(app, stackName(config, 'api'), {
    ...props,
    stackName: stackName(config, 'api'),
    productsTable: databaseStack.productsTable,
    ordersTable: databaseStack.ordersTable,
    assetsBucket: storageStack.assetsBucket,
    siteCertificate: frontendStack.siteCertificate,
  });
  apiStack.addDependency(databaseStack);
  apiStack.addDependency(authStack);
  apiStack.addDependency(storageStack);
  apiStack.addDependency(frontendStack);

  return { databaseStack, authStack, storageStack, apiStack, frontendStack };
}

describe('CDK stacks scaffold', () => {
  test('all five stacks synth for dev', () => {
    const { apiStack, databaseStack, authStack, storageStack, frontendStack } =
      synthStacks(devConfig);

    expect(apiStack.cognitoAuthorizer).toBeDefined();

    for (const stack of [databaseStack, authStack, storageStack, apiStack, frontendStack]) {
      Template.fromStack(stack);
    }
  });

  test('all five stacks synth for prod with custom domain', () => {
    const { apiStack, databaseStack, authStack, storageStack, frontendStack } =
      synthStacks(prodDomainConfig);

    expect(apiStack.cognitoAuthorizer).toBeDefined();

    for (const stack of [databaseStack, authStack, storageStack, apiStack, frontendStack]) {
      Template.fromStack(stack);
    }
  });
});
