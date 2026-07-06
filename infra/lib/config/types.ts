export interface AppConfig {
  env: 'dev' | 'prod';
  region: string;
  account: string;
  domainName?: string;
  apiSubdomain?: string;
  hostedZoneId?: string;
  adminEmail: string;
}
