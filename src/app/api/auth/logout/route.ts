import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { AuthController } from '@/presentation/controllers/AuthController';

const authController = new AuthController();

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
