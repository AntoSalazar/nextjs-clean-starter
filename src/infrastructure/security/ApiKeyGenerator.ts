import type { IApiKeyGenerator, GeneratedApiKey } from '@/domain/interfaces/services/IApiKeyGenerator';
import { AppConfig } from '@/infrastructure/config/AppConfig';

export class ApiKeyGenerator implements IApiKeyGenerator {
  private readonly prefix: string;

  constructor() {
    this.prefix = AppConfig.apiKeyPrefix;
  }

  async generate(): Promise<GeneratedApiKey> {
    // Generate 32 random bytes for the key
    const randomBytes = new Uint8Array(32);
    crypto.getRandomValues(randomBytes);

    // Convert to hex string
    const keyBody = Array.from(randomBytes)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

    // Full key with prefix
    const rawKey = `${this.prefix}${keyBody}`;

    // Extract prefix for lookup (first 8 chars of the key body)
    const prefix = keyBody.substring(0, 8);

    // Hash the full key
    const hash = await this.hash(rawKey);

    return {
      rawKey,
      prefix,
      hash,
    };
  }

  async hash(key: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(key);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  }

  async verify(key: string, storedHash: string): Promise<boolean> {
    const keyHash = await this.hash(key);
    return keyHash === storedHash;
  }
}
