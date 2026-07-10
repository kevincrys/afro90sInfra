import * as fs from 'node:fs';
import * as path from 'node:path';
import { DevAccessConfig } from './types';

const LOCAL_FILE = 'dev.access.local.json';

const ENV_ALLOWED_IPS = 'AFRO90S_DEV_ACCESS_ALLOWED_IPS';
const ENV_BASIC_AUTH_USERNAME = 'AFRO90S_DEV_ACCESS_BASIC_AUTH_USERNAME';
const ENV_BASIC_AUTH_PASSWORD = 'AFRO90S_DEV_ACCESS_BASIC_AUTH_PASSWORD';

function parseAllowedIps(raw: unknown): string[] | undefined {
  if (!Array.isArray(raw) || raw.length === 0) {
    return undefined;
  }
  const ips = raw.filter((value): value is string => typeof value === 'string' && value.length > 0);
  return ips.length > 0 ? ips : undefined;
}

function parseBasicAuth(raw: unknown): DevAccessConfig['cloudFrontBasicAuth'] | undefined {
  if (!raw || typeof raw !== 'object') {
    return undefined;
  }
  const { username, password } = raw as DevAccessConfig['cloudFrontBasicAuth'];
  if (typeof username !== 'string' || username.length === 0) {
    return undefined;
  }
  if (typeof password !== 'string' || password.length === 0) {
    return undefined;
  }
  return { username, password };
}

/** Validates and normalizes a dev access payload (file, env, or tests). */
export function parseDevAccessConfig(raw: unknown): DevAccessConfig | undefined {
  if (!raw || typeof raw !== 'object') {
    return undefined;
  }

  const { allowedApiSourceIps, cloudFrontBasicAuth } = raw as DevAccessConfig;
  const ips = parseAllowedIps(allowedApiSourceIps);
  const auth = parseBasicAuth(cloudFrontBasicAuth);
  if (!ips || !auth) {
    return undefined;
  }

  return { allowedApiSourceIps: ips, cloudFrontBasicAuth: auth };
}

function parseAllowedIpsFromEnv(raw: string): string[] | undefined {
  const trimmed = raw.trim();
  if (!trimmed) {
    return undefined;
  }

  try {
    return parseAllowedIps(JSON.parse(trimmed));
  } catch {
    const ips = trimmed
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean);
    return ips.length > 0 ? ips : undefined;
  }
}

/** Loads dev access from CI/local env vars (GitHub Secrets → workflow env). */
export function loadDevAccessFromEnv(): DevAccessConfig | undefined {
  const ipsRaw = process.env[ENV_ALLOWED_IPS];
  const username = process.env[ENV_BASIC_AUTH_USERNAME];
  const password = process.env[ENV_BASIC_AUTH_PASSWORD];

  if (!ipsRaw || !username || !password) {
    return undefined;
  }

  const allowedApiSourceIps = parseAllowedIpsFromEnv(ipsRaw);
  if (!allowedApiSourceIps) {
    return undefined;
  }

  return parseDevAccessConfig({
    allowedApiSourceIps,
    cloudFrontBasicAuth: { username, password },
  });
}

/** Loads dev access rules from a gitignored local file (never commit real IPs/passwords). */
export function loadDevAccessFromLocalFile(): DevAccessConfig | undefined {
  const localPath = path.join(__dirname, LOCAL_FILE);
  if (!fs.existsSync(localPath)) {
    return undefined;
  }

  const raw: unknown = JSON.parse(fs.readFileSync(localPath, 'utf8'));
  return parseDevAccessConfig(raw);
}

/**
 * Dev access for synth/deploy: env vars (CI) take precedence over local JSON (developer machine).
 * Unit tests skip both sources via JEST_WORKER_ID.
 */
export function loadDevAccess(): DevAccessConfig | undefined {
  if (process.env.JEST_WORKER_ID !== undefined) {
    return undefined;
  }

  return loadDevAccessFromEnv() ?? loadDevAccessFromLocalFile();
}
