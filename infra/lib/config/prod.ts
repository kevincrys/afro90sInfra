import { AppConfig } from './types';
import { loadSesConfig } from './load-ses-config';

const ses = loadSesConfig();

export const prodConfig: AppConfig = {
  env: 'prod',
  region: 'us-east-1',
  account: '083171867610',
  adminEmail: '',
  domainName: 'afroo90s.com.br',
  apiSubdomain: 'api',
  // Replace before deploy: Route 53 console → Hosted zones → afroo90s.com.br → Hosted zone ID
  hostedZoneId: 'Z02812533TSU7ULEQGTOF',
  // Task 18 — CI/local: AFRO90S_ADMIN_NOTIFICATION_EMAIL (secret). From = noreply@afroo90s.com.br in code.
  ...(ses ? { ses } : {}),
};
