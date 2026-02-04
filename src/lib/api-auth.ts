import { NextResponse } from 'next/server';
import { JWTSessionService } from '@/infrastructure/security/JWTSessionService';
import { ApiKeyGenerator } from '@/infrastructure/security/ApiKeyGenerator';
import { PrismaUserRepository } from '@/infrastructure/database/repositories/PrismaUserRepository';
import { PrismaApiKeyRepository } from '@/infrastructure/database/repositories/PrismaApiKeyRepository';
import type { TokenPayload } from '@/domain/interfaces/services/ISessionService';
import { hasPermission, Permission, isAdmin } from './permissions';

const sessionService = new JWTSessionService();
const apiKeyGenerator = new ApiKeyGenerator();
const userRepository = new PrismaUserRepository();
const apiKeyRepository = new PrismaApiKeyRepository();

export interface AuthenticatedUser {
  userId: string;
  email: string;
  role: string;
  permissions: string[];
  authMethod: 'jwt' | 'api_key';
}

export async function getAuthenticatedUser(request: Request): Promise<AuthenticatedUser | null> {
  const authHeader = request.headers.get('Authorization');
  let token: string | undefined;

  // 1. Check Authorization header
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  // 2. Check cookies if no header token
  if (!token) {
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    token = cookieStore.get('access_token')?.value;
  }

  if (!token) {
    return null;
  }

  // Check if it's an API key (starts with prefix)
  if (token.startsWith(process.env.API_KEY_PREFIX ?? 'sk_')) {
    return authenticateWithApiKey(token);
  }

  // Try JWT authentication
  return authenticateWithJWT(token);
}

async function authenticateWithJWT(token: string): Promise<AuthenticatedUser | null> {
  const payload = await sessionService.verifyAccessToken(token);

  if (!payload) {
    return null;
  }

  return {
    userId: payload.userId,
    email: payload.email,
    role: payload.role,
    permissions: payload.permissions,
    authMethod: 'jwt',
  };
}

async function authenticateWithApiKey(apiKey: string): Promise<AuthenticatedUser | null> {
  // Extract prefix from key (first 8 chars after the sk_ prefix)
  const prefix = apiKey.slice((process.env.API_KEY_PREFIX ?? 'sk_').length, (process.env.API_KEY_PREFIX ?? 'sk_').length + 8);

  // Find all keys with this prefix
  const keys = await apiKeyRepository.findByPrefix(prefix);

  // Find matching key by hash
  for (const key of keys) {
    if (!key.isActive) continue;

    // Check expiration
    if (key.expiresAt && key.expiresAt < new Date()) {
      continue;
    }

    // Verify hash
    const isValid = await apiKeyGenerator.verify(apiKey, key.keyHash);
    if (isValid) {
      // Update last used
      await apiKeyRepository.updateLastUsed(key.id);

      // Get user
      const user = await userRepository.findById(key.userId);
      if (!user || !user.isActive) {
        return null;
      }

      return {
        userId: user.id,
        email: user.email,
        role: user.role,
        permissions: [...user.permissions, ...key.scopes],
        authMethod: 'api_key',
      };
    }
  }

  return null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RouteContext = { params: Promise<any> };

export function requireAuth<T extends RouteContext = RouteContext>(
  handler: (request: Request, user: AuthenticatedUser, context: T) => Promise<NextResponse>
) {
  return async (request: Request, context: T): Promise<NextResponse> => {
    const user = await getAuthenticatedUser(request);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 });
    }

    return handler(request, user, context);
  };
}

export function requireAdmin<T extends RouteContext = RouteContext>(
  handler: (request: Request, user: AuthenticatedUser, context: T) => Promise<NextResponse>
) {
  return async (request: Request, context: T): Promise<NextResponse> => {
    const user = await getAuthenticatedUser(request);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 });
    }

    if (user.role !== 'admin' && !isAdmin(user.permissions)) {
      return NextResponse.json({ error: 'Forbidden', code: 'FORBIDDEN' }, { status: 403 });
    }

    return handler(request, user, context);
  };
}

export function requirePermission<T extends RouteContext = RouteContext>(
  permission: Permission,
  handler: (request: Request, user: AuthenticatedUser, context: T) => Promise<NextResponse>
) {
  return async (request: Request, context: T): Promise<NextResponse> => {
    const user = await getAuthenticatedUser(request);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 });
    }

    if (!hasPermission(user.permissions, permission)) {
      return NextResponse.json({ error: 'Forbidden', code: 'FORBIDDEN' }, { status: 403 });
    }

    return handler(request, user, context);
  };
}
