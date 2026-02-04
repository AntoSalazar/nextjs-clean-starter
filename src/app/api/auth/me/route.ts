import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api-auth';
import { UserController } from '@/presentation/controllers/UserController';
import { NotFoundError } from '@/domain/errors';

const userController = new UserController();

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get current user
 *     description: Returns the currently authenticated user's profile information.
 *     tags:
 *       - Auth
 *     security:
 *       - BearerAuth: []
 *       - ApiKeyAuth: []
 *     responses:
 *       200:
 *         description: Current user profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   format: uuid
 *                 email:
 *                   type: string
 *                   format: email
 *                 fullName:
 *                   type: string
 *                 role:
 *                   type: string
 *                   enum: [admin, user]
 *                 permissions:
 *                   type: array
 *                   items:
 *                     type: string
 *                 isActive:
 *                   type: boolean
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 authMethod:
 *                   type: string
 *                   enum: [jwt, api_key]
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
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
