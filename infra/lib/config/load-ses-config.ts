import { SesConfig } from './types';

/** Public system From address — safe to commit (not a secret). */
export const SES_FROM_EMAIL = 'noreply@afroo90s.com.br';

const ENV_ADMIN = 'AFRO90S_ADMIN_NOTIFICATION_EMAIL';

/** Builds SesConfig when admin notification email is present. */
export function parseSesConfig(raw: unknown): SesConfig | undefined {
  if (!raw || typeof raw !== 'object') {
    return undefined;
  }
  const { adminNotificationEmail } = raw as Partial<SesConfig>;
  if (
    typeof adminNotificationEmail !== 'string' ||
    adminNotificationEmail.trim().length === 0
  ) {
    return undefined;
  }
  const fromRaw = (raw as Partial<SesConfig>).fromEmail;
  const fromEmail =
    typeof fromRaw === 'string' && fromRaw.trim().length > 0
      ? fromRaw.trim()
      : SES_FROM_EMAIL;
  return {
    fromEmail,
    adminNotificationEmail: adminNotificationEmail.trim(),
  };
}

/**
 * Loads SES config: From is fixed in code; admin destination from env
 * (GitHub secret `ADMIN_NOTIFICATION_EMAIL` → `AFRO90S_ADMIN_NOTIFICATION_EMAIL`).
 */
export function loadSesConfigFromEnv(): SesConfig | undefined {
  return parseSesConfig({
    fromEmail: SES_FROM_EMAIL,
    adminNotificationEmail: process.env[ENV_ADMIN],
  });
}

/**
 * SES config for synth/deploy. Unit tests skip via JEST_WORKER_ID.
 */
export function loadSesConfig(): SesConfig | undefined {
  if (process.env.JEST_WORKER_ID !== undefined) {
    return undefined;
  }
  return loadSesConfigFromEnv();
}

export function isSesEnabled(config: { ses?: SesConfig }): boolean {
  return Boolean(config.ses?.fromEmail && config.ses?.adminNotificationEmail);
}
