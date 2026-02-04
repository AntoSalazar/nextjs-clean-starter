import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api-auth';
import { PrismaApiKeyRepository } from '@/infrastructure/database/repositories/PrismaApiKeyRepository';
import { NotFoundError } from '@/domain/errors';

const apiKeyRepository = new PrismaApiKeyRepository();

type Context = { params: Promise<{ id: string }> };

export const DELETE = requireAuth<Context>(async (_request, user, context) => {
  try {
    const { id } = await context.params;

    // Get API key
    const apiKey = await apiKeyRepository.findById(id);

    if (!apiKey) {
      throw NotFoundError.apiKey(id);
    }

    // Ensure user owns this API key
    if (apiKey.userId !== user.userId) {
      return NextResponse.json({ error: 'Forbidden', code: 'FORBIDDEN' }, { status: 403 });
    }

    // Revoke (soft delete) the API key
    await apiKeyRepository.revoke(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof NotFoundError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.statusCode }
      );
    }

    console.error('Delete API key error:', error);
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
});
