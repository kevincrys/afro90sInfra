import {
  loadSesConfigFromEnv,
  parseSesConfig,
  SES_FROM_EMAIL,
} from '../lib/config/load-ses-config';

describe('load-ses-config', () => {
  const originalAdmin = process.env.AFRO90S_ADMIN_NOTIFICATION_EMAIL;

  afterEach(() => {
    if (originalAdmin === undefined) {
      delete process.env.AFRO90S_ADMIN_NOTIFICATION_EMAIL;
    } else {
      process.env.AFRO90S_ADMIN_NOTIFICATION_EMAIL = originalAdmin;
    }
  });

  test('SES_FROM_EMAIL is the public noreply address', () => {
    expect(SES_FROM_EMAIL).toBe('noreply@afroo90s.com.br');
  });

  test('parseSesConfig requires admin email and defaults From', () => {
    expect(parseSesConfig({})).toBeUndefined();
    expect(parseSesConfig({ fromEmail: 'a@b.com' })).toBeUndefined();
    expect(
      parseSesConfig({
        adminNotificationEmail: ' admin@afroo90s.com.br ',
      }),
    ).toEqual({
      fromEmail: SES_FROM_EMAIL,
      adminNotificationEmail: 'admin@afroo90s.com.br',
    });
  });

  test('loadSesConfigFromEnv reads only admin secret', () => {
    delete process.env.AFRO90S_ADMIN_NOTIFICATION_EMAIL;
    expect(loadSesConfigFromEnv()).toBeUndefined();

    process.env.AFRO90S_ADMIN_NOTIFICATION_EMAIL = 'ops@example.com';
    expect(loadSesConfigFromEnv()).toEqual({
      fromEmail: SES_FROM_EMAIL,
      adminNotificationEmail: 'ops@example.com',
    });
  });
});
