import type { User } from '@/domain/entities/User';

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  permissions: string[];
}

export interface SessionTokens {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: Date;
  refreshTokenExpiresAt: Date;
}

export interface ISessionService {
  createAccessToken(user: User): Promise<string>;
  createRefreshToken(): Promise<{ token: string; hash: string }>;
  verifyAccessToken(token: string): Promise<TokenPayload | null>;
  hashRefreshToken(token: string): Promise<string>;
  getAccessTokenExpiry(): Date;
  getRefreshTokenExpiry(): Date;
}
