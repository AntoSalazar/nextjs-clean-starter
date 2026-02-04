import { NextResponse } from 'next/server';
import { requireAdmin, type AuthenticatedUser } from '@/lib/api-auth';
import { UserController } from '@/presentation/controllers/UserController';
import { UpdateUserSchema } from '@/application/dto/user/UpdateUserDTO';
import { ValidationError, NotFoundError } from '@/domain/errors';

const userController = new UserController();

type Context = { params: Promise<{ id: string }> };

export const GET = requireAdmin<Context>(async (_request, _user, context) => {
  try {
    const { id } = await context.params;
    const user = await userController.getUser(id);
    return NextResponse.json({ user });
  } catch (error) {
    if (error instanceof NotFoundError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.statusCode }
      );
    }

    console.error('Get user error:', error);
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
});

export const PUT = requireAdmin<Context>(async (request, _user, context) => {
  try {
    const { id } = await context.params;
    const body = await request.json();

    // Validate input
    const parseResult = UpdateUserSchema.safeParse(body);
    if (!parseResult.success) {
      throw ValidationError.fromZodError(parseResult.error);
    }

    const updatedUser = await userController.updateUser(id, parseResult.data);

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json(
        { error: error.message, code: error.code, errors: error.errors },
        { status: error.statusCode }
      );
    }

    if (error instanceof NotFoundError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.statusCode }
      );
    }

    console.error('Update user error:', error);
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
});

export const DELETE = requireAdmin<Context>(async (_request, _user, context) => {
  try {
    const { id } = await context.params;
    await userController.deleteUser(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof NotFoundError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.statusCode }
      );
    }

    console.error('Delete user error:', error);
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
});
