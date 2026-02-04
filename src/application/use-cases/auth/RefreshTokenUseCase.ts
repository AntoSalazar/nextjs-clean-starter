import type { IUserRepository } from '@/domain/interfaces/repositories/IUserRepository';
import type { IRefreshTokenRepository } from '@/domain/interfaces/repositories/IRefreshTokenRepository';
import type { ISessionService } from '@/domain/interfaces/services/ISessionService';
import { AuthenticationError } from '@/domain/errors';

export interface RefreshTokenOutput {
  accessToken: string;
  accessTokenExpiresAt: Date;
  newRefreshToken?: string;
}

export class RefreshTokenUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly refreshTokenRepository: IRefreshTokenRepository,
    private readonly sessionService: ISessionService
  ) {}

  async execute(refreshToken: string, rotateRefreshToken = false): Promise<RefreshTokenOutput> {
    // Hash the refresh token
    const tokenHash = await this.sessionService.hashRefreshToken(refreshToken);

    // Find the refresh token
    const storedToken = await this.refreshTokenRepository.findByTokenHash(tokenHash);
    if (!storedToken) {
      throw AuthenticationError.refreshTokenInvalid();
    }

    // Check if token is expired
    if (storedToken.expiresAt < new Date()) {
      throw AuthenticationError.refreshTokenExpired();
    }

    // Find the user
    const user = await this.userRepository.findById(storedToken.userId);
    if (!user) {
      throw AuthenticationError.refreshTokenInvalid();
    }

    // Check if user is active
    if (!user.isActive) {
      throw AuthenticationError.userInactive();
    }

    // Create new access token
    const accessToken = await this.sessionService.createAccessToken(user);
    const accessTokenExpiresAt = this.sessionService.getAccessTokenExpiry();

    const result: RefreshTokenOutput = {
      accessToken,
      accessTokenExpiresAt,
    };

    // Optionally rotate refresh token
    if (rotateRefreshToken) {
      // Revoke old token
      await this.refreshTokenRepository.revoke(storedToken.id);

      // Create new refresh token
      const { token: newRefreshToken, hash: newRefreshTokenHash } =
        await this.sessionService.createRefreshToken();
      const refreshTokenExpiresAt = this.sessionService.getRefreshTokenExpiry();

      // Store new refresh token
      await this.refreshTokenRepository.create({
        userId: user.id,
        tokenHash: newRefreshTokenHash,
        expiresAt: refreshTokenExpiresAt,
      });

      result.newRefreshToken = newRefreshToken;
    }

    return result;
  }
}
