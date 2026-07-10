import { AppConfig } from '../../lib/config/types';

/** Dev config with access restriction — used in unit tests (task 22). */
export const devAccessConfig: AppConfig = {
  env: 'dev',
  region: 'us-east-1',
  account: '083171867610',
  adminEmail: '',
  devAccess: {
    allowedApiSourceIps: ['203.0.113.10/32'],
    cloudFrontBasicAuth: { username: 'dev', password: 'test-secret' },
  },
};
