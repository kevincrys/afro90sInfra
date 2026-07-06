import * as route53 from 'aws-cdk-lib/aws-route53';
import { Construct } from 'constructs';
import { AppConfig } from '../config';

export function hasCustomDomain(config: AppConfig): boolean {
  return Boolean(
    config.domainName &&
      config.hostedZoneId &&
      !config.hostedZoneId.startsWith('REPLACE_'),
  );
}

export function resolveHostedZone(
  scope: Construct,
  id: string,
  config: AppConfig,
): route53.IHostedZone | undefined {
  if (!hasCustomDomain(config)) {
    return undefined;
  }

  return route53.HostedZone.fromHostedZoneAttributes(scope, id, {
    hostedZoneId: config.hostedZoneId!,
    zoneName: config.domainName!,
  });
}

export function apiFqdn(config: AppConfig): string | undefined {
  if (!config.domainName || !config.apiSubdomain) {
    return undefined;
  }
  return `${config.apiSubdomain}.${config.domainName}`;
}

export function webOriginUrl(config: AppConfig): string {
  return `https://${config.domainName}`;
}
