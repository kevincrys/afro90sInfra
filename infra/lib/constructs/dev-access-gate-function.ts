import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import { Construct } from 'constructs';
import type { AppConfig, DevAccessConfig } from '../config/types';
import { resourceName } from './naming';

export interface DevAccessGateFunctionProps {
  config: AppConfig;
  devAccess: DevAccessConfig;
}

function buildBasicAuthExpectedHeader(username: string, password: string): string {
  const token = Buffer.from(`${username}:${password}`, 'utf8').toString('base64');
  return `Basic ${token}`;
}

function escapeForInlineJs(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

export class DevAccessGateFunction extends Construct {
  public readonly function: cloudfront.Function;

  constructor(scope: Construct, id: string, props: DevAccessGateFunctionProps) {
    super(scope, id);

    const expectedAuth = escapeForInlineJs(
      buildBasicAuthExpectedHeader(
        props.devAccess.cloudFrontBasicAuth.username,
        props.devAccess.cloudFrontBasicAuth.password,
      ),
    );

    this.function = new cloudfront.Function(this, 'Function', {
      functionName: resourceName(props.config, 'cf', 'dev-access-gate'),
      code: cloudfront.FunctionCode.fromInline(`
function handler(event) {
  var request = event.request;
  var auth = request.headers.authorization;
  if (auth && auth.value === '${expectedAuth}') {
    return request;
  }
  return {
    statusCode: 401,
    statusDescription: 'Unauthorized',
    headers: {
      'www-authenticate': { value: 'Basic realm="Afro90s Dev"' },
      'content-type': { value: 'text/plain; charset=utf-8' },
    },
    body: 'Unauthorized',
  };
}
`.trim()),
    });
  }
}
