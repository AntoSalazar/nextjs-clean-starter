import prisma from '../PrismaClient';
import type { ApiKey } from '@/domain/entities/ApiKey';
import type { IApiKeyRepository, CreateApiKeyInput } from '@/domain/interfaces/repositories/IApiKeyRepository';

function mapToDomain(data: {
  id: string;
  user_id: string;
  name: string;
  key_prefix: string;
  key_hash: string;
  scopes: string[];
  is_active: boolean;
  last_used_at: Date | null;
  expires_at: Date | null;
  created_at: Date;
}): ApiKey {
  return {
    id: data.id,
    userId: data.user_id,
    name: data.name,
    keyPrefix: data.key_prefix,
    keyHash: data.key_hash,
    scopes: data.scopes,
    isActive: data.is_active,
    lastUsedAt: data.last_used_at,
    expiresAt: data.expires_at,
    createdAt: data.created_at,
  };
}

export class PrismaApiKeyRepository implements IApiKeyRepository {
  async findById(id: string): Promise<ApiKey | null> {
    const apiKey = await prisma.api_keys.findUnique({ where: { id } });
    return apiKey ? mapToDomain(apiKey) : null;
  }

  async findByPrefix(prefix: string): Promise<ApiKey[]> {
    const apiKeys = await prisma.api_keys.findMany({
      where: {
        key_prefix: prefix,
        is_active: true,
      },
    });
    return apiKeys.map(mapToDomain);
  }

  async findByUserId(userId: string): Promise<ApiKey[]> {
    const apiKeys = await prisma.api_keys.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
    });
    return apiKeys.map(mapToDomain);
  }

  async create(input: CreateApiKeyInput): Promise<ApiKey> {
    const apiKey = await prisma.api_keys.create({
      data: {
        user_id: input.userId,
        name: input.name,
        key_prefix: input.keyPrefix,
        key_hash: input.keyHash,
        scopes: input.scopes ?? [],
        expires_at: input.expiresAt ?? null,
      },
    });
    return mapToDomain(apiKey);
  }

  async updateLastUsed(id: string): Promise<void> {
    await prisma.api_keys.update({
      where: { id },
      data: { last_used_at: new Date() },
    });
  }

  async revoke(id: string): Promise<void> {
    await prisma.api_keys.update({
      where: { id },
      data: { is_active: false },
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.api_keys.delete({ where: { id } });
  }
}
