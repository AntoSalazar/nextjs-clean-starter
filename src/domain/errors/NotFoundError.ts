export class NotFoundError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly resource: string;

  constructor(resource: string, identifier?: string) {
    const message = identifier
      ? `${resource} with identifier '${identifier}' not found`
      : `${resource} not found`;
    super(message);
    this.name = 'NotFoundError';
    this.code = 'NOT_FOUND';
    this.statusCode = 404;
    this.resource = resource;
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }

  static user(identifier?: string): NotFoundError {
    return new NotFoundError('User', identifier);
  }

  static apiKey(identifier?: string): NotFoundError {
    return new NotFoundError('API Key', identifier);
  }

  static refreshToken(): NotFoundError {
    return new NotFoundError('Refresh Token');
  }
}
