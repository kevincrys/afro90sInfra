import { Construct } from 'constructs';
import * as cdk from 'aws-cdk-lib';
import { Afro90sStackProps } from './stack-props';

/** Scaffold — bucket S3 assets na task 07. */
export class StorageStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: Afro90sStackProps) {
    super(scope, id, props);
  }
}
