import { devConfig } from './dev';
import { prodConfig } from './prod';
import { AppConfig } from './types';

export type { AppConfig, DevAccessConfig } from './types';
export { isDevAccessEnabled } from './types';
export { devConfig, prodConfig };

export function getConfig(env: string): AppConfig {
  if (env === 'dev') return devConfig;
  if (env === 'prod') return prodConfig;
  throw new Error(`Invalid env: ${env}. Expected 'dev' or 'prod'.`);
}
