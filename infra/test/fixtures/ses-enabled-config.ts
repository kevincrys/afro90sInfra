import { AppConfig } from '../../lib/config/types';
import { SES_FROM_EMAIL } from '../../lib/config/load-ses-config';

/** Dev config with SES for unit tests (admin email is fake — never a real secret). */
export const sesEnabledConfig: AppConfig = {
  env: 'dev',
  region: 'us-east-1',
  account: '083171867610',
  adminEmail: '',
  ses: {
    fromEmail: SES_FROM_EMAIL,
    adminNotificationEmail: 'ops@example.com',
  },
};
