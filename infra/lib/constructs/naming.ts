import { AppConfig } from '../config';

/** Padrão: afro90s-{env}-{tipo}-{nome} */
export function resourceName(config: AppConfig, type: string, name: string): string {
  return `afro90s-${config.env}-${type}-${name}`;
}
