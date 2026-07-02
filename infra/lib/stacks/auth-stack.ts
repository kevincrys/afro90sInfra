import { Construct } from 'constructs';
import * as cdk from 'aws-cdk-lib';
import { Afro90sStackProps } from './stack-props';

/** Scaffold — recursos Cognito na task 13. */
export class AuthStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: Afro90sStackProps) {
    super(scope, id, props);
  }
}
