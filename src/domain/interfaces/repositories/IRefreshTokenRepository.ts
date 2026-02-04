import type { RefreshToken, RefreshTokenCreate } from '@/domain/entities/RefreshToken';

export interface IRefreshTokenRepository {
  findByTokenHash(tokenHash: string): Promise<RefreshToken | null>;
  findActiveByUserId(userId: string): Promise<RefreshToken[]>;
  create(input: RefreshTokenCreate): Promise<RefreshToken>;
  revoke(id: string): Promise<void>;
  revokeAllForUser(userId: string): Promise<void>;
  deleteExpired(): Promise<number>;
}
