import { Construct } from 'constructs';
import * as cdk from 'aws-cdk-lib';
import { Afro90sStackProps } from './stack-props';

/** Scaffold — recursos DynamoDB na task 05. */
export class DatabaseStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: Afro90sStackProps) {
    super(scope, id, props);
  }
}
