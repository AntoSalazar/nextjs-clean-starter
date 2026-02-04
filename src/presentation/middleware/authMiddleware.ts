import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

export interface AuthMiddlewareResult {
  authenticated: boolean;
  userId?: string;
  email?: string;
  role?: string;
  permissions?: string[];
}

export async function verifyAuth(request: NextRequest): Promise<AuthMiddlewareResult> {
  // Get token from cookie or header
  const accessToken =
    request.cookies.get('access_token')?.value ||
    request.headers.get('Authorization')?.replace('Bearer ', '');

  if (!accessToken) {
    return { authenticated: false };
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(accessToken, secret);

    return {
      authenticated: true,
      userId: payload.userId as string,
      email: payload.email as string,
      role: payload.role as string,
      permissions: payload.permissions as string[],
    };
  } catch {
    return { authenticated: false };
  }
}

export function createAuthResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}
