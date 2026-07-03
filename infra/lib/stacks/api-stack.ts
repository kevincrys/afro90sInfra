import * as cdk from 'aws-cdk-lib';
import * as apigwv2 from 'aws-cdk-lib/aws-apigatewayv2';
import * as apigwv2Authorizers from 'aws-cdk-lib/aws-apigatewayv2-authorizers';
import * as apigwv2Integrations from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import { Construct } from 'constructs';
import { LambdaAdminRole } from '../constructs/lambda-admin-role';
import { LambdaOrdersPublicRole } from '../constructs/lambda-orders-public-role';
import { LambdaProductsPublicRole } from '../constructs/lambda-products-public-role';
import { AppConfig } from '../config';
import { resourceName } from '../constructs/naming';
import { Afro90sStackProps, cfnExportName } from './stack-props';

export interface ApiStackProps extends Afro90sStackProps {
  productsTable: dynamodb.ITable;
  ordersTable: dynamodb.ITable;
  assetsBucket: s3.IBucket;
}

const LAMBDA_FLOWS = [
  'products-public',
  'orders-public',
  'products-admin',
  'orders-admin',
] as const;

type LambdaFlow = (typeof LAMBDA_FLOWS)[number];

export class ApiStack extends cdk.Stack {
  public readonly productsPublicRole: LambdaProductsPublicRole;
  public readonly ordersPublicRole: LambdaOrdersPublicRole;
  public readonly adminRole: LambdaAdminRole;
  public readonly productsPublicFunction: lambda.Function;
  public readonly ordersPublicFunction: lambda.Function;
  public readonly productsAdminFunction: lambda.Function;
  public readonly ordersAdminFunction: lambda.Function;
  public readonly httpApi: apigwv2.HttpApi;
  public readonly cognitoAuthorizer: apigwv2Authorizers.HttpJwtAuthorizer;
  public readonly lambdaArtifactsBucket: s3.Bucket;

  constructor(scope: Construct, id: string, props: ApiStackProps) {
    super(scope, id, props);

    const { config, productsTable, ordersTable, assetsBucket } = props;
    const isProd = config.env === 'prod';

    const cloudFrontWebUrl = ssm.StringParameter.valueForStringParameter(
      this,
      `/afro90s/${config.env}/cloudfront-web-url`,
    );
    const assetsCdnUrl = ssm.StringParameter.valueForStringParameter(
      this,
      `/afro90s/${config.env}/assets-cdn-url`,
    );

    this.productsPublicRole = new LambdaProductsPublicRole(this, 'ProductsPublicRole', {
      config,
      productsTable,
    });

    this.ordersPublicRole = new LambdaOrdersPublicRole(this, 'OrdersPublicRole', {
      config,
      productsTable,
      ordersTable,
    });

    this.adminRole = new LambdaAdminRole(this, 'AdminRole', {
      config,
      productsTable,
      ordersTable,
      assetsBucket,
    });

    this.lambdaArtifactsBucket = new s3.Bucket(this, 'LambdaArtifactsBucket', {
      bucketName: resourceName(config, 's3', 'lambda-artifacts'),
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
      versioned: true,
      removalPolicy: isProd ? cdk.RemovalPolicy.RETAIN : cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: !isProd,
      enforceSSL: true,
      lifecycleRules: LAMBDA_FLOWS.map((flow) => ({
        id: `ExpireOld${flow.replace(/-/g, '')}Packages`,
        prefix: `${flow}/`,
        expiration: cdk.Duration.days(90),
      })),
    });

    const sesDisabled = { SES_ENABLED: 'false' };

    this.productsPublicFunction = this.createFlowLambda({
      id: 'ProductsPublicFunction',
      flow: 'products-public',
      role: this.productsPublicRole.role,
      config,
      isProd,
      environment: {
        PRODUCTS_TABLE: productsTable.tableName,
        ASSETS_CDN_URL: assetsCdnUrl,
        ...sesDisabled,
      },
    });

    this.ordersPublicFunction = this.createFlowLambda({
      id: 'OrdersPublicFunction',
      flow: 'orders-public',
      role: this.ordersPublicRole.role,
      config,
      isProd,
      environment: {
        PRODUCTS_TABLE: productsTable.tableName,
        ORDERS_TABLE: ordersTable.tableName,
        ASSETS_CDN_URL: assetsCdnUrl,
        ...sesDisabled,
      },
    });

    const adminEnv = {
      PRODUCTS_TABLE: productsTable.tableName,
      ORDERS_TABLE: ordersTable.tableName,
      ASSETS_BUCKET: assetsBucket.bucketName,
      ASSETS_CDN_URL: assetsCdnUrl,
      ...sesDisabled,
    };

    this.productsAdminFunction = this.createFlowLambda({
      id: 'ProductsAdminFunction',
      flow: 'products-admin',
      role: this.adminRole.role,
      config,
      isProd,
      environment: adminEnv,
    });

    this.ordersAdminFunction = this.createFlowLambda({
      id: 'OrdersAdminFunction',
      flow: 'orders-admin',
      role: this.adminRole.role,
      config,
      isProd,
      environment: adminEnv,
    });

    this.httpApi = new apigwv2.HttpApi(this, 'HttpApi', {
      apiName: resourceName(config, 'apigw', 'api'),
      createDefaultStage: false,
      corsPreflight: {
        allowOrigins: [cloudFrontWebUrl],
        allowMethods: [
          apigwv2.CorsHttpMethod.GET,
          apigwv2.CorsHttpMethod.POST,
          apigwv2.CorsHttpMethod.PUT,
          apigwv2.CorsHttpMethod.DELETE,
          apigwv2.CorsHttpMethod.OPTIONS,
        ],
        allowHeaders: ['Content-Type', 'Authorization'],
      },
    });

    new apigwv2.HttpStage(this, 'ApiStage', {
      httpApi: this.httpApi,
      stageName: config.env,
      autoDeploy: true,
      throttle: {
        rateLimit: 5,
        burstLimit: 10,
      },
    });

    const cognitoUserPoolId = ssm.StringParameter.valueForStringParameter(
      this,
      `/afro90s/${config.env}/cognito-user-pool-id`,
    );
    const cognitoClientId = ssm.StringParameter.valueForStringParameter(
      this,
      `/afro90s/${config.env}/cognito-client-id`,
    );
    const cognitoIssuer = `https://cognito-idp.${config.region}.amazonaws.com/${cognitoUserPoolId}`;

    // Criado na fase 2; rotas /admin/* aplicam na task 16.
    this.cognitoAuthorizer = new apigwv2Authorizers.HttpJwtAuthorizer(
      'CognitoAuthorizer',
      cognitoIssuer,
      {
        jwtAudience: [cognitoClientId],
      },
    );

    const productsIntegration = new apigwv2Integrations.HttpLambdaIntegration(
      'ProductsPublicIntegration',
      this.productsPublicFunction,
      { payloadFormatVersion: apigwv2.PayloadFormatVersion.VERSION_2_0 },
    );

    const ordersIntegration = new apigwv2Integrations.HttpLambdaIntegration(
      'OrdersPublicIntegration',
      this.ordersPublicFunction,
      { payloadFormatVersion: apigwv2.PayloadFormatVersion.VERSION_2_0 },
    );

    this.httpApi.addRoutes({
      path: '/products',
      methods: [apigwv2.HttpMethod.GET],
      integration: productsIntegration,
    });

    this.httpApi.addRoutes({
      path: '/products/{id}',
      methods: [apigwv2.HttpMethod.GET],
      integration: productsIntegration,
    });

    this.httpApi.addRoutes({
      path: '/orders',
      methods: [apigwv2.HttpMethod.POST],
      integration: ordersIntegration,
    });

    const apiBaseUrl = this.httpApi.apiEndpoint;

    new ssm.StringParameter(this, 'ApiBaseUrlParam', {
      parameterName: `/afro90s/${config.env}/api-base-url`,
      stringValue: apiBaseUrl,
    });

    const functionNameParams: Array<[string, string, lambda.Function]> = [
      ['ProductsPublic', 'products-public', this.productsPublicFunction],
      ['OrdersPublic', 'orders-public', this.ordersPublicFunction],
      ['ProductsAdmin', 'products-admin', this.productsAdminFunction],
      ['OrdersAdmin', 'orders-admin', this.ordersAdminFunction],
    ];

    for (const [idSuffix, flow, fn] of functionNameParams) {
      new ssm.StringParameter(this, `${idSuffix}FunctionNameParam`, {
        parameterName: `/afro90s/${config.env}/lambda-${flow}-name`,
        stringValue: fn.functionName,
      });
    }

    new ssm.StringParameter(this, 'LambdaArtifactsBucketParam', {
      parameterName: `/afro90s/${config.env}/lambda-artifacts-bucket`,
      stringValue: this.lambdaArtifactsBucket.bucketName,
    });

    new ssm.StringParameter(this, 'WhatsappNumberParam', {
      parameterName: `/afro90s/${config.env}/whatsapp-number`,
      stringValue: '5521920051220',
      description: 'Store WhatsApp for wa.me after checkout (digits only, DDI+DDD+number)',
    });

    new cdk.CfnOutput(this, 'ApiBaseUrl', {
      value: apiBaseUrl,
      exportName: cfnExportName(config, 'ApiBaseUrl'),
    });

    new cdk.CfnOutput(this, 'LambdaArtifactsBucketName', {
      value: this.lambdaArtifactsBucket.bucketName,
      exportName: cfnExportName(config, 'LambdaArtifactsBucketName'),
    });

    new cdk.CfnOutput(this, 'LambdaProductsPublicFunctionName', {
      value: this.productsPublicFunction.functionName,
      exportName: cfnExportName(config, 'LambdaProductsPublicFunctionName'),
    });

    new cdk.CfnOutput(this, 'LambdaOrdersPublicFunctionName', {
      value: this.ordersPublicFunction.functionName,
      exportName: cfnExportName(config, 'LambdaOrdersPublicFunctionName'),
    });

    new cdk.CfnOutput(this, 'LambdaProductsAdminFunctionName', {
      value: this.productsAdminFunction.functionName,
      exportName: cfnExportName(config, 'LambdaProductsAdminFunctionName'),
    });

    new cdk.CfnOutput(this, 'LambdaOrdersAdminFunctionName', {
      value: this.ordersAdminFunction.functionName,
      exportName: cfnExportName(config, 'LambdaOrdersAdminFunctionName'),
    });
  }

  private createFlowLambda(options: {
    id: string;
    flow: LambdaFlow;
    role: iam.IRole;
    config: AppConfig;
    isProd: boolean;
    environment: Record<string, string>;
  }): lambda.Function {
    const { id, flow, role, config, isProd, environment } = options;
    const functionName = resourceName(config, 'lambda', flow);

    const logGroup = new logs.LogGroup(this, `${id}LogGroup`, {
      logGroupName: `/aws/lambda/${functionName}`,
      retention: logs.RetentionDays.TWO_WEEKS,
      removalPolicy: isProd ? cdk.RemovalPolicy.RETAIN : cdk.RemovalPolicy.DESTROY,
    });

    // Placeholder until afro90sBackend publishes {flow}/latest.zip (ADR-007).
    return new lambda.Function(this, id, {
      functionName,
      runtime: lambda.Runtime.NODEJS_24_X,
      handler: 'handler.handler',
      memorySize: 256,
      timeout: cdk.Duration.seconds(29),
      role,
      logGroup,
      code: lambda.Code.fromInline(`
exports.handler = async () => ({
  statusCode: 503,
  body: JSON.stringify({ code: 'NOT_DEPLOYED', flow: '${flow}', message: 'Awaiting deploy from afro90sBackend' }),
});
      `.trim()),
      environment,
    });
  }
}
