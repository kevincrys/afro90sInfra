export interface DevAccessConfig {
  allowedApiSourceIps: string[];
  cloudFrontBasicAuth: {
    username: string;
    password: string;
  };
}

export interface AppConfig {
  env: 'dev' | 'prod';
  region: string;
  account: string;
  domainName?: string;
  apiSubdomain?: string;
  hostedZoneId?: string;
  adminEmail: string;
  /** Dev-only: IP allowlist on API + Basic Auth on CloudFront SPA (task 22). */
  devAccess?: DevAccessConfig;
}

export function isDevAccessEnabled(config: AppConfig): boolean {
  if (config.env !== 'dev' || !config.devAccess) {
    return false;
  }
  const { allowedApiSourceIps, cloudFrontBasicAuth } = config.devAccess;
  return (
    allowedApiSourceIps.length > 0 &&
    cloudFrontBasicAuth.username.length > 0 &&
    cloudFrontBasicAuth.password.length > 0
  );
}
