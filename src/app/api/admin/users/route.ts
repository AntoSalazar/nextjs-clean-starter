import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/api-auth';
import { UserController } from '@/presentation/controllers/UserController';
import { CreateUserSchema } from '@/application/dto/user/CreateUserDTO';
import { ValidationError } from '@/domain/errors';

const userController = new UserController();

export const GET = requireAdmin(async (_request, _user, _context) => {
  try {
    const users = await userController.getAllUsers();
    return NextResponse.json({ users });
  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
});

export const POST = requireAdmin(async (request, _user, _context) => {
  try {
    const body = await request.json();

    // Validate input
    const parseResult = CreateUserSchema.safeParse(body);
    if (!parseResult.success) {
      throw ValidationError.fromZodError(parseResult.error);
    }

    const newUser = await userController.createUser(parseResult.data);

    return NextResponse.json({ user: newUser }, { status: 201 });
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json(
        { error: error.message, code: error.code, errors: error.errors },
        { status: error.statusCode }
      );
    }

    console.error('Create user error:', error);
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
});
