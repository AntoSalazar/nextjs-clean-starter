function getEnvVar(key: string, defaultValue?: string): string {
  const value = process.env[key] ?? defaultValue;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

function getEnvVarOptional(key: string): string | undefined {
  return process.env[key];
}

export const AppConfig = {
  // Application
  nodeEnv: getEnvVar('NODE_ENV', 'development'),
  appName: getEnvVar('NEXT_PUBLIC_APP_NAME', 'Starter Kit'),
  appUrl: getEnvVar('NEXT_PUBLIC_APP_URL', 'http://localhost:3000'),

  // Database
  databaseUrl: getEnvVar('DATABASE_URL'),

  // JWT
  jwtSecret: getEnvVar('JWT_SECRET'),
  jwtExpiresIn: getEnvVar('JWT_EXPIRES_IN', '15m'),
  refreshTokenExpiresIn: getEnvVar('REFRESH_TOKEN_EXPIRES_IN', '7d'),

  // API Keys
  apiKeyPrefix: getEnvVar('API_KEY_PREFIX', 'sk_'),

  // Email (optional)
  resendApiKey: getEnvVarOptional('RESEND_API_KEY'),
  emailFrom: getEnvVarOptional('EMAIL_FROM'),

  // Admin seed
  adminEmail: getEnvVar('ADMIN_EMAIL', 'admin@example.com'),
  adminPassword: getEnvVar('ADMIN_PASSWORD', 'admin123'),
  adminName: getEnvVar('ADMIN_NAME', 'Super Admin'),

  // Helpers
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
} as const;

export function parseExpirationToMs(expiration: string): number {
  const match = expiration.match(/^(\d+)(m|h|d)$/);
  if (!match) {
    throw new Error(`Invalid expiration format: ${expiration}`);
  }
  const value = parseInt(match[1], 10);
  const unit = match[2];
  switch (unit) {
    case 'm':
      return value * 60 * 1000;
    case 'h':
      return value * 60 * 60 * 1000;
    case 'd':
      return value * 24 * 60 * 60 * 1000;
    default:
      throw new Error(`Invalid expiration unit: ${unit}`);
  }
}
