#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { getConfig } from '../lib/config';
import { FoundationStack } from '../lib/stacks/foundation-stack';

const app = new cdk.App();
const envName = app.node.tryGetContext('env') as string | undefined;

if (!envName || (envName !== 'dev' && envName !== 'prod')) {
  throw new Error('Contexto obrigatório: -c env=dev ou -c env=prod');
}

const config = getConfig(envName);

new FoundationStack(app, `afro90s-${config.env}-stack-foundation`, {
  stackName: `afro90s-${config.env}-stack-foundation`,
  env: { account: config.account, region: config.region },
  envName: config.env,
});
