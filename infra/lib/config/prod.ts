import { AppConfig } from './types';

export const prodConfig: AppConfig = {
  env: 'prod',
  region: 'us-east-1',
  account: '083171867610',
  adminEmail: '',
  domainName: 'afroo90s.com.br',
  apiSubdomain: 'api',
  // Replace before deploy: Route 53 console → Hosted zones → afroo90s.com.br → Hosted zone ID
  hostedZoneId: 'Z02812533TSU7ULEQGTOF',
};
