import { AppConfig } from './types';
import { loadDevAccess } from './load-dev-access';
import { loadSesConfig } from './load-ses-config';

const devAccess = loadDevAccess();
const ses = loadSesConfig();

export const devConfig: AppConfig = {
  env: 'dev',
  region: 'us-east-1',
  account: '083171867610',
  adminEmail: '',
  // Task 22 — CI: GitHub Secrets (dev env). Local: dev.access.local.json (gitignored).
  ...(devAccess ? { devAccess } : {}),
  // Task 18 — CI/local: AFRO90S_ADMIN_NOTIFICATION_EMAIL (secret). From = noreply@afroo90s.com.br in code.
  ...(ses ? { ses } : {}),
};
