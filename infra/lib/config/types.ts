export interface AppConfig {
  env: 'dev' | 'prod';
  region: string;
  account: string;
  domainName?: string;
  adminEmail: string;
}
