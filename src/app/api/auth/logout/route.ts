import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { AuthController } from '@/presentation/controllers/AuthController';

const authController = new AuthController();

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: User logout
 *     description: Invalidate the session and clear authentication cookies.
 *     tags:
 *       - Auth
 *     responses:
 *       200:
 *         description: Logout successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *       500:
 *         description: Internal server error
 */
export async function POST() {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get('refresh_token')?.value;

    // Revoke refresh token if present
    if (refreshToken) {
      await authController.logout(refreshToken);
    }

    // Clear cookies
    cookieStore.delete('refresh_token');
    cookieStore.delete('access_token');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Logout error:', error);
    // Still clear cookies even if revocation fails
    const cookieStore = await cookies();
    cookieStore.delete('refresh_token');
    cookieStore.delete('access_token');

    return NextResponse.json({ success: true });
  }
}
