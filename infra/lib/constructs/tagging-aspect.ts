import * as cdk from 'aws-cdk-lib';
import { IAspect, Tags } from 'aws-cdk-lib';
import { IConstruct } from 'constructs';

export class TaggingAspect implements IAspect {
  constructor(private readonly env: string) {}

  visit(node: IConstruct): void {
    if (!cdk.Stack.isStack(node)) {
      return;
    }

    Tags.of(node).add('project', 'afro90s');
    Tags.of(node).add('env', this.env);
    Tags.of(node).add('managed-by', 'afro90sInfra');
  }
}
