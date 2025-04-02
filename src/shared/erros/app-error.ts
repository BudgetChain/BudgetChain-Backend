/**
 * Base application error class that extends Error
 * All custom errors should extend this class
 */
export class AppError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Authentication related errors
 */
export class AuthenticationError extends AppError {
  constructor(message = 'Authentication failed') {
    super(message);
  }
}

/**
 * Authorization related errors
 */
export class AuthorizationError extends AppError {
  constructor(message = 'Not authorized to perform this action') {
    super(message);
  }
}

/**
 * Validation related errors
 */
export class ValidationError extends AppError {
  constructor(message = 'Validation failed') {
    super(message);
  }
}

/**
 * Not found errors
 */
export class NotFoundError extends AppError {
  constructor(entity = 'Resource', id?: string) {
    super(`${entity}${id ? ` with ID ${id}` : ''} not found`);
  }
}

/**
 * Conflict errors (e.g., duplicate entries)
 */
export class ConflictError extends AppError {
  constructor(message = 'Resource already exists') {
    super(message);
  }
}

/**
 * External service errors
 */
export class ExternalServiceError extends AppError {
  constructor(service: string, message = 'External service error') {
    super(`${service}: ${message}`);
  }
}

/**
 * Database related errors
 */
export class DatabaseError extends AppError {
  constructor(message = 'Database operation failed') {
    super(message);
  }
}

/**
 * Type guard to check if an error is an instance of AppError
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

/**
 * Helper function to format error messages for logging
 */
export function formatErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}
