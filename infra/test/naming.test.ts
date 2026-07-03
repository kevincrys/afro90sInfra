import { devConfig } from '../lib/config';
import { resourceName } from '../lib/constructs/naming';

describe('resourceName', () => {
  test('builds physical name from config', () => {
    expect(resourceName(devConfig, 's3', 'web')).toBe('afro90s-dev-s3-web');
    expect(resourceName({ ...devConfig, env: 'prod' }, 'lambda', 'products-public')).toBe(
      'afro90s-prod-lambda-products-public',
    );
  });
});
