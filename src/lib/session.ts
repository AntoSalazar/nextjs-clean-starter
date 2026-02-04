import { cookies } from 'next/headers';
import { JWTSessionService } from '@/infrastructure/security/JWTSessionService';
import type { TokenPayload } from '@/domain/interfaces/services/ISessionService';

const sessionService = new JWTSessionService();

export const REFRESH_TOKEN_COOKIE = 'refresh_token';

export async function getSession(): Promise<TokenPayload | null> {
  const cookieStore = await cookies();
  const authHeader = cookieStore.get('access_token')?.value;

  if (!authHeader) {
    return null;
  }

  return sessionService.verifyAccessToken(authHeader);
}

export async function verifyAccessToken(token: string): Promise<TokenPayload | null> {
  return sessionService.verifyAccessToken(token);
}

export async function setRefreshTokenCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  const expiresAt = sessionService.getRefreshTokenExpiry();

  cookieStore.set(REFRESH_TOKEN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: expiresAt,
  });
}

export async function getRefreshTokenFromCookie(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(REFRESH_TOKEN_COOKIE)?.value ?? null;
}

export async function clearRefreshTokenCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(REFRESH_TOKEN_COOKIE);
}
