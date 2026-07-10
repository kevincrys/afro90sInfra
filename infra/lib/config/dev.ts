import { AppConfig } from './types';
import { loadDevAccess } from './load-dev-access';

const devAccess = loadDevAccess();

export const devConfig: AppConfig = {
  env: 'dev',
  region: 'us-east-1',
  account: '083171867610',
  adminEmail: '',
  // Task 22 — CI: GitHub Secrets (dev env). Local: dev.access.local.json (gitignored).
  ...(devAccess ? { devAccess } : {}),
};
