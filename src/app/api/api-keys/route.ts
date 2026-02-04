import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAuth } from '@/lib/api-auth';
import { PrismaApiKeyRepository } from '@/infrastructure/database/repositories/PrismaApiKeyRepository';
import { ApiKeyGenerator } from '@/infrastructure/security/ApiKeyGenerator';
import { toApiKeyPublic, type ApiKeyWithRawKey } from '@/domain/entities/ApiKey';
import { ValidationError } from '@/domain/errors';

const apiKeyRepository = new PrismaApiKeyRepository();
const apiKeyGenerator = new ApiKeyGenerator();

const CreateApiKeySchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  scopes: z.array(z.string()).optional().default([]),
  expiresInDays: z.number().min(1).max(365).optional(),
});

export const GET = requireAuth(async (_request, user, _context) => {
  try {
    const apiKeys = await apiKeyRepository.findByUserId(user.userId);
    return NextResponse.json({
      apiKeys: apiKeys.map(toApiKeyPublic),
    });
  } catch (error) {
    console.error('Get API keys error:', error);
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
});

export const POST = requireAuth(async (request, user, _context) => {
  try {
    const body = await request.json();

    // Validate input
    const parseResult = CreateApiKeySchema.safeParse(body);
    if (!parseResult.success) {
      throw ValidationError.fromZodError(parseResult.error);
    }

    const { name, scopes, expiresInDays } = parseResult.data;

    // Generate API key
    const { rawKey, prefix, hash } = await apiKeyGenerator.generate();

    // Calculate expiration
    const expiresAt = expiresInDays
      ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
      : null;

    // Create API key
    const apiKey = await apiKeyRepository.create({
      userId: user.userId,
      name,
      keyPrefix: prefix,
      keyHash: hash,
      scopes,
      expiresAt,
    });

    // Return with raw key (only shown once!)
    const response: ApiKeyWithRawKey = {
      ...toApiKeyPublic(apiKey),
      rawKey,
    };

    return NextResponse.json(
      {
        apiKey: response,
        message: 'Save this API key securely. It will not be shown again.',
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json(
        { error: error.message, code: error.code, errors: error.errors },
        { status: error.statusCode }
      );
    }

    console.error('Create API key error:', error);
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
});
