import type { ApiKey } from '@/domain/entities/ApiKey';

export interface CreateApiKeyInput {
  userId: string;
  name: string;
  keyPrefix: string;
  keyHash: string;
  scopes?: string[];
  expiresAt?: Date | null;
}

export interface IApiKeyRepository {
  findById(id: string): Promise<ApiKey | null>;
  findByPrefix(prefix: string): Promise<ApiKey[]>;
  findByUserId(userId: string): Promise<ApiKey[]>;
  create(input: CreateApiKeyInput): Promise<ApiKey>;
  updateLastUsed(id: string): Promise<void>;
  revoke(id: string): Promise<void>;
  delete(id: string): Promise<void>;
}
