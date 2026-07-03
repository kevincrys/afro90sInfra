import * as cdk from 'aws-cdk-lib';
import { AppConfig } from '../config';

export interface Afro90sStackProps extends cdk.StackProps {
  config: AppConfig;
}

export function stackName(config: AppConfig, suffix: string): string {
  return `afro90s-${config.env}-stack-${suffix}`;
}

/** Stable CloudFormation export name for cross-stack / script consumption. */
export function cfnExportName(config: AppConfig, output: string): string {
  return `afro90s-${config.env}-${output}`;
}
