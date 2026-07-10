import {
  loadDevAccessFromEnv,
  parseDevAccessConfig,
} from '../lib/config/load-dev-access';

describe('loadDevAccessFromEnv', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env.AFRO90S_DEV_ACCESS_ALLOWED_IPS;
    delete process.env.AFRO90S_DEV_ACCESS_BASIC_AUTH_USERNAME;
    delete process.env.AFRO90S_DEV_ACCESS_BASIC_AUTH_PASSWORD;
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  test('returns config from JSON array env var', () => {
    process.env.AFRO90S_DEV_ACCESS_ALLOWED_IPS = '["203.0.113.0/24","2001:db8::/48"]';
    process.env.AFRO90S_DEV_ACCESS_BASIC_AUTH_USERNAME = 'dev';
    process.env.AFRO90S_DEV_ACCESS_BASIC_AUTH_PASSWORD = 'test-secret';

    expect(loadDevAccessFromEnv()).toEqual({
      allowedApiSourceIps: ['203.0.113.0/24', '2001:db8::/48'],
      cloudFrontBasicAuth: { username: 'dev', password: 'test-secret' },
    });
  });

  test('returns config from comma-separated env var', () => {
    process.env.AFRO90S_DEV_ACCESS_ALLOWED_IPS = '203.0.113.0/24, 2001:db8::/48';
    process.env.AFRO90S_DEV_ACCESS_BASIC_AUTH_USERNAME = 'dev';
    process.env.AFRO90S_DEV_ACCESS_BASIC_AUTH_PASSWORD = 'test-secret';

    expect(loadDevAccessFromEnv()?.allowedApiSourceIps).toEqual([
      '203.0.113.0/24',
      '2001:db8::/48',
    ]);
  });

  test('returns undefined when env vars are incomplete', () => {
    process.env.AFRO90S_DEV_ACCESS_ALLOWED_IPS = '["203.0.113.0/24"]';
    expect(loadDevAccessFromEnv()).toBeUndefined();
  });
});

describe('parseDevAccessConfig', () => {
  test('rejects invalid payloads', () => {
    expect(parseDevAccessConfig(null)).toBeUndefined();
    expect(parseDevAccessConfig({ allowedApiSourceIps: [], cloudFrontBasicAuth: {} })).toBeUndefined();
    expect(
      parseDevAccessConfig({
        allowedApiSourceIps: ['203.0.113.0/24'],
        cloudFrontBasicAuth: { username: 'dev', password: '' },
      }),
    ).toBeUndefined();
  });
});
