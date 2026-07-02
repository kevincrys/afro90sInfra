import { getConfig } from '../lib/config';

describe('getConfig', () => {
  test('returns dev config', () => {
    const config = getConfig('dev');
    expect(config.env).toBe('dev');
    expect(config.account).toBe('083171867610');
    expect(config.region).toBe('us-east-1');
  });

  test('returns prod config', () => {
    const config = getConfig('prod');
    expect(config.env).toBe('prod');
    expect(config.account).toBe('083171867610');
    expect(config.region).toBe('us-east-1');
  });

  test('throws for invalid env', () => {
    expect(() => getConfig('staging')).toThrow('env inválido: staging');
  });
});
