import { AppConfig } from '../../lib/config/types';

/** Prod config with custom domain — used in unit tests (avoids stale compiled prod.js). */
export const prodDomainConfig: AppConfig = {
  env: 'prod',
  region: 'us-east-1',
  account: '083171867610',
  adminEmail: '',
  domainName: 'afroo90s.com.br',
  apiSubdomain: 'api',
  hostedZoneId: 'Z0123456789ABCDEFGHIJ',
};
