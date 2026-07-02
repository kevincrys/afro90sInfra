#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { TaggingAspect } from '../lib/constructs/tagging-aspect';
import { getConfig } from '../lib/config';
import { ApiStack } from '../lib/stacks/api-stack';
import { AuthStack } from '../lib/stacks/auth-stack';
import { DatabaseStack } from '../lib/stacks/database-stack';
import { FrontendStack } from '../lib/stacks/frontend-stack';
import { stackName } from '../lib/stacks/stack-props';
import { StorageStack } from '../lib/stacks/storage-stack';

const app = new cdk.App();
const envName = app.node.tryGetContext('env') as string | undefined;

if (!envName || (envName !== 'dev' && envName !== 'prod')) {
  throw new Error('Required context: pass -c env=dev or -c env=prod');
}

const config = getConfig(envName);

const baseProps = {
  config,
  env: { account: config.account, region: config.region },
};

const databaseStack = new DatabaseStack(app, stackName(config, 'database'), {
  ...baseProps,
  stackName: stackName(config, 'database'),
});

const authStack = new AuthStack(app, stackName(config, 'auth'), {
  ...baseProps,
  stackName: stackName(config, 'auth'),
});

const storageStack = new StorageStack(app, stackName(config, 'storage'), {
  ...baseProps,
  stackName: stackName(config, 'storage'),
});

const apiStack = new ApiStack(app, stackName(config, 'api'), {
  ...baseProps,
  stackName: stackName(config, 'api'),
});
apiStack.addDependency(databaseStack);
apiStack.addDependency(authStack);
apiStack.addDependency(storageStack);

new FrontendStack(app, stackName(config, 'frontend'), {
  ...baseProps,
  stackName: stackName(config, 'frontend'),
});

cdk.Aspects.of(app).add(new TaggingAspect(config.env), {
  priority: cdk.AspectPriority.MUTATING,
});
