import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import { Construct } from 'constructs';
import { resourceName } from '../constructs/naming';
import { Afro90sStackProps, cfnExportName } from './stack-props';

export class StorageStack extends cdk.Stack {
  public readonly assetsBucket: s3.Bucket;

  constructor(scope: Construct, id: string, props: Afro90sStackProps) {
    super(scope, id, props);

    const { config } = props;
    const isProd = config.env === 'prod';

    this.assetsBucket = new s3.Bucket(this, 'AssetsBucket', {
      bucketName: resourceName(config, 's3', 'assets'),
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
      versioned: false,
      removalPolicy: isProd ? cdk.RemovalPolicy.RETAIN : cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: !isProd,
      enforceSSL: false,
      lifecycleRules: [
        {
          id: 'AbortIncompleteMultipartUploads',
          abortIncompleteMultipartUploadAfter: cdk.Duration.days(7),
        },
      ],
    });

    new ssm.StringParameter(this, 'AssetsBucketNameParam', {
      parameterName: `/afro90s/${config.env}/assets-bucket-name`,
      stringValue: this.assetsBucket.bucketName,
    });

    new ssm.StringParameter(this, 'AssetsBucketArnParam', {
      parameterName: `/afro90s/${config.env}/assets-bucket-arn`,
      stringValue: this.assetsBucket.bucketArn,
    });

    new cdk.CfnOutput(this, 'AssetsBucketName', {
      value: this.assetsBucket.bucketName,
      exportName: cfnExportName(config, 'AssetsBucketName'),
    });
  }
}
