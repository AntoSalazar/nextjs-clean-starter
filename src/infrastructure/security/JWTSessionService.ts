import { SignJWT, jwtVerify } from 'jose';
import type { User } from '@/domain/entities/User';
import type { ISessionService, TokenPayload } from '@/domain/interfaces/services/ISessionService';
import { AppConfig, parseExpirationToMs } from '@/infrastructure/config/AppConfig';

export class JWTSessionService implements ISessionService {
  private readonly secret: Uint8Array;
  private readonly accessTokenExpiresIn: string;
  private readonly refreshTokenExpiresIn: string;

  constructor() {
    this.secret = new TextEncoder().encode(AppConfig.jwtSecret);
    this.accessTokenExpiresIn = AppConfig.jwtExpiresIn;
    this.refreshTokenExpiresIn = AppConfig.refreshTokenExpiresIn;
  }

  async createAccessToken(user: User): Promise<string> {
    const payload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      permissions: user.permissions,
    };

    const token = await new SignJWT(payload as unknown as Record<string, unknown>)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(this.accessTokenExpiresIn)
      .setSubject(user.id)
      .sign(this.secret);

    return token;
  }

  async createRefreshToken(): Promise<{ token: string; hash: string }> {
    const randomBytes = new Uint8Array(32);
    crypto.getRandomValues(randomBytes);
    const token = Array.from(randomBytes)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

    const hash = await this.hashRefreshToken(token);

    return { token, hash };
  }

  async verifyAccessToken(token: string): Promise<TokenPayload | null> {
    try {
      const { payload } = await jwtVerify(token, this.secret);
      return {
        userId: payload.userId as string,
        email: payload.email as string,
        role: payload.role as string,
        permissions: payload.permissions as string[],
      };
    } catch {
      return null;
    }
  }

  async hashRefreshToken(token: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(token);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  }

  getAccessTokenExpiry(): Date {
    const expiresInMs = parseExpirationToMs(this.accessTokenExpiresIn);
    return new Date(Date.now() + expiresInMs);
  }

  getRefreshTokenExpiry(): Date {
    const expiresInMs = parseExpirationToMs(this.refreshTokenExpiresIn);
    return new Date(Date.now() + expiresInMs);
  }
}
