import { Construct } from 'constructs';
import * as cdk from 'aws-cdk-lib';
import { Afro90sStackProps } from './stack-props';

/** Scaffold — S3 web + CloudFront na task 06. */
export class FrontendStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: Afro90sStackProps) {
    super(scope, id, props);
  }
}
