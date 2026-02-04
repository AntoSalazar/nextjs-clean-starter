export interface ValidationErrorDetail {
  field: string;
  message: string;
}

export class ValidationError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly errors: ValidationErrorDetail[];

  constructor(message: string, errors: ValidationErrorDetail[] = []) {
    super(message);
    this.name = 'ValidationError';
    this.code = 'VALIDATION_ERROR';
    this.statusCode = 400;
    this.errors = errors;
    Object.setPrototypeOf(this, ValidationError.prototype);
  }

  static fromZodError(zodError: { errors: { path: (string | number)[]; message: string }[] }): ValidationError {
    const errors = zodError.errors.map((err) => ({
      field: err.path.join('.'),
      message: err.message,
    }));
    return new ValidationError('Validation failed', errors);
  }

  static field(field: string, message: string): ValidationError {
    return new ValidationError(message, [{ field, message }]);
  }
}
