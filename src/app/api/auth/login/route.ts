import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { AuthController } from '@/presentation/controllers/AuthController';
import { LoginSchema } from '@/application/dto/auth/LoginDTO';
import { ValidationError, AuthenticationError } from '@/domain/errors';
import { JWTSessionService } from '@/infrastructure/security/JWTSessionService';

const authController = new AuthController();
const sessionService = new JWTSessionService();

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate input
    const parseResult = LoginSchema.safeParse(body);
    if (!parseResult.success) {
      throw ValidationError.fromZodError(parseResult.error);
    }

    // Execute login
    const result = await authController.login(parseResult.data);

    // Set refresh token in httpOnly cookie
    const cookieStore = await cookies();
    cookieStore.set('refresh_token', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      expires: sessionService.getRefreshTokenExpiry(),
    });

    // Also set access token in cookie for middleware
    cookieStore.set('access_token', result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      expires: result.accessTokenExpiresAt,
    });

    return NextResponse.json({
      accessToken: result.accessToken,
      expiresAt: result.accessTokenExpiresAt.toISOString(),
      user: result.user,
    });
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json(
        { error: error.message, code: error.code, errors: error.errors },
        { status: error.statusCode }
      );
    }

    if (error instanceof AuthenticationError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.statusCode }
      );
    }

    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
