import type { IRefreshTokenRepository } from '@/domain/interfaces/repositories/IRefreshTokenRepository';
import type { ISessionService } from '@/domain/interfaces/services/ISessionService';

export class LogoutUseCase {
  constructor(
    private readonly refreshTokenRepository: IRefreshTokenRepository,
    private readonly sessionService: ISessionService
  ) {}

  async execute(refreshToken: string): Promise<void> {
    // Hash the refresh token
    const tokenHash = await this.sessionService.hashRefreshToken(refreshToken);

    // Find and revoke the refresh token
    const token = await this.refreshTokenRepository.findByTokenHash(tokenHash);
    if (token) {
      await this.refreshTokenRepository.revoke(token.id);
    }
  }

  async executeForUser(userId: string): Promise<void> {
    // Revoke all refresh tokens for the user
    await this.refreshTokenRepository.revokeAllForUser(userId);
  }
}
