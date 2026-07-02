import { Construct } from 'constructs';
import * as cdk from 'aws-cdk-lib';
import { Afro90sStackProps } from './stack-props';

/** Scaffold — API Gateway + Lambda na task 10. */
export class ApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: Afro90sStackProps) {
    super(scope, id, props);
  }
}
