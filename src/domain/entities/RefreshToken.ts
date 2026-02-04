export interface RefreshToken {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  createdAt: Date;
  revokedAt: Date | null;
}

export interface RefreshTokenCreate {
  userId: string;
  tokenHash: string;
  expiresAt: Date;
}
