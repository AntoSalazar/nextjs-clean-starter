import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api-auth';
import { UserController } from '@/presentation/controllers/UserController';
import { NotFoundError } from '@/domain/errors';

const userController = new UserController();

export const GET = requireAuth(async (_request, user, _context) => {
  try {
    const fullUser = await userController.getUser(user.userId);

    return NextResponse.json({
      id: fullUser.id,
      email: fullUser.email,
      fullName: fullUser.fullName,
      role: fullUser.role,
      permissions: fullUser.permissions,
      isActive: fullUser.isActive,
      createdAt: fullUser.createdAt,
      authMethod: user.authMethod,
    });
  } catch (error) {
    if (error instanceof NotFoundError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.statusCode }
      );
    }

    console.error('Get me error:', error);
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
});
