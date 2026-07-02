import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';

export interface FoundationStackProps extends cdk.StackProps {
  envName: 'dev' | 'prod';
}

/** Placeholder stack — recursos reais entram nas tasks 01+. */
export class FoundationStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: FoundationStackProps) {
    super(scope, id, props);

    cdk.Tags.of(this).add('project', 'afro90s');
    cdk.Tags.of(this).add('env', props.envName);
    cdk.Tags.of(this).add('managed-by', 'afro90sInfra');

    new cdk.CfnOutput(this, 'Environment', {
      value: props.envName,
      description: 'Ambiente CDK ativo',
    });
  }
}
