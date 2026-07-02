#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { FoundationStack } from '../lib/stacks/foundation-stack';

const app = new cdk.App();
const envName = app.node.tryGetContext('env') as string | undefined;

if (!envName || (envName !== 'dev' && envName !== 'prod')) {
  throw new Error('Contexto obrigatório: -c env=dev ou -c env=prod');
}

const account = process.env.CDK_DEFAULT_ACCOUNT ?? '083171867610';
const region = process.env.CDK_DEFAULT_REGION ?? 'us-east-1';

new FoundationStack(app, `afro90s-${envName}-stack-foundation`, {
  stackName: `afro90s-${envName}-stack-foundation`,
  env: { account, region },
  envName: envName as 'dev' | 'prod',
});
