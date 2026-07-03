import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { devConfig } from '../lib/config';
import { ApiStack } from '../lib/stacks/api-stack';
import { AuthStack } from '../lib/stacks/auth-stack';
import { DatabaseStack } from '../lib/stacks/database-stack';
import { FrontendStack } from '../lib/stacks/frontend-stack';
import { stackName } from '../lib/stacks/stack-props';
import { StorageStack } from '../lib/stacks/storage-stack';

const env = { account: devConfig.account, region: devConfig.region };
const baseProps = { config: devConfig, env };

describe('CDK stacks scaffold', () => {
  test('all five stacks synth for dev', () => {
    const app = new cdk.App();

    const databaseStack = new DatabaseStack(app, stackName(devConfig, 'database'), {
      ...baseProps,
      stackName: stackName(devConfig, 'database'),
    });
    const authStack = new AuthStack(app, stackName(devConfig, 'auth'), {
      ...baseProps,
      stackName: stackName(devConfig, 'auth'),
    });
    const storageStack = new StorageStack(app, stackName(devConfig, 'storage'), {
      ...baseProps,
      stackName: stackName(devConfig, 'storage'),
    });
    const apiStack = new ApiStack(app, stackName(devConfig, 'api'), {
      ...baseProps,
      stackName: stackName(devConfig, 'api'),
      productsTable: databaseStack.productsTable,
      ordersTable: databaseStack.ordersTable,
    });
    apiStack.addDependency(databaseStack);
    apiStack.addDependency(authStack);
    apiStack.addDependency(storageStack);

    const frontendStack = new FrontendStack(app, stackName(devConfig, 'frontend'), {
      ...baseProps,
      stackName: stackName(devConfig, 'frontend'),
    });
    frontendStack.addDependency(storageStack);

    for (const stack of [databaseStack, authStack, storageStack, apiStack, frontendStack]) {
      Template.fromStack(stack);
    }
  });
});
