import prisma from '../PrismaClient';
import type { RefreshToken, RefreshTokenCreate } from '@/domain/entities/RefreshToken';
import type { IRefreshTokenRepository } from '@/domain/interfaces/repositories/IRefreshTokenRepository';

function mapToDomain(data: {
  id: string;
  user_id: string;
  token_hash: string;
  expires_at: Date;
  created_at: Date;
  revoked_at: Date | null;
}): RefreshToken {
  return {
    id: data.id,
    userId: data.user_id,
    tokenHash: data.token_hash,
    expiresAt: data.expires_at,
    createdAt: data.created_at,
    revokedAt: data.revoked_at,
  };
}

export class PrismaRefreshTokenRepository implements IRefreshTokenRepository {
  async findByTokenHash(tokenHash: string): Promise<RefreshToken | null> {
    const token = await prisma.refresh_tokens.findFirst({
      where: {
        token_hash: tokenHash,
        revoked_at: null,
        expires_at: { gt: new Date() },
      },
    });
    return token ? mapToDomain(token) : null;
  }

  async findActiveByUserId(userId: string): Promise<RefreshToken[]> {
    const tokens = await prisma.refresh_tokens.findMany({
      where: {
        user_id: userId,
        revoked_at: null,
        expires_at: { gt: new Date() },
      },
      orderBy: { created_at: 'desc' },
    });
    return tokens.map(mapToDomain);
  }

  async create(input: RefreshTokenCreate): Promise<RefreshToken> {
    const token = await prisma.refresh_tokens.create({
      data: {
        user_id: input.userId,
        token_hash: input.tokenHash,
        expires_at: input.expiresAt,
      },
    });
    return mapToDomain(token);
  }

  async revoke(id: string): Promise<void> {
    await prisma.refresh_tokens.update({
      where: { id },
      data: { revoked_at: new Date() },
    });
  }

  async revokeAllForUser(userId: string): Promise<void> {
    await prisma.refresh_tokens.updateMany({
      where: {
        user_id: userId,
        revoked_at: null,
      },
      data: { revoked_at: new Date() },
    });
  }

  async deleteExpired(): Promise<number> {
    const result = await prisma.refresh_tokens.deleteMany({
      where: {
        OR: [{ expires_at: { lt: new Date() } }, { revoked_at: { not: null } }],
      },
    });
    return result.count;
  }
}
