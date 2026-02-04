import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { AuthController } from '@/presentation/controllers/AuthController';
import { AuthenticationError } from '@/domain/errors';
import { JWTSessionService } from '@/infrastructure/security/JWTSessionService';

const authController = new AuthController();
const sessionService = new JWTSessionService();

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Refresh access token
 *     description: Get a new access token using the httpOnly refresh token cookie.
 *     tags:
 *       - Auth
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rotate:
 *                 type: boolean
 *                 description: Optionally rotate the refresh token
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                 expiresAt:
 *                   type: string
 *                   format: date-time
 *       401:
 *         description: Invalid or expired refresh token
 *       500:
 *         description: Internal server error
 */
export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get('refresh_token')?.value;

    if (!refreshToken) {
      throw AuthenticationError.refreshTokenInvalid();
    }

    // Check if rotation is requested
    const body = await request.json().catch(() => ({}));
    const rotate = body.rotate === true;

    // Refresh the token
    const result = await authController.refreshToken(refreshToken, rotate);

    // Update access token cookie
    cookieStore.set('access_token', result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      expires: result.accessTokenExpiresAt,
    });

    // Update refresh token cookie if rotated
    if (result.newRefreshToken) {
      cookieStore.set('refresh_token', result.newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        expires: sessionService.getRefreshTokenExpiry(),
      });
    }

    return NextResponse.json({
      accessToken: result.accessToken,
      expiresAt: result.accessTokenExpiresAt.toISOString(),
    });
  } catch (error) {
    if (error instanceof AuthenticationError) {
      // Clear cookies on auth error
      const cookieStore = await cookies();
      cookieStore.delete('refresh_token');
      cookieStore.delete('access_token');

      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.statusCode }
      );
    }

    console.error('Refresh token error:', error);
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
