export class CustomError extends Error {
  statusCode: number;
  details?: any;

  constructor(message: string, statusCode: number, details?: any) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    
    // Ensure the name of this error is the same as the class name
    this.name = this.constructor.name;
    
    // This clips the constructor invocation from the stack trace
    Error.captureStackTrace(this, this.constructor);
  }
}

export class BadRequestError extends CustomError {
  constructor(message = 'Bad Request', details?: any) {
    super(message, 400, details);
  }
}

export class UnauthorizedError extends CustomError {
  constructor(message = 'Unauthorized') {
    super(message, 401);
  }
}

export class ForbiddenError extends CustomError {
  constructor(message = 'Forbidden') {
    super(message, 403);
  }
}

export class NotFoundError extends CustomError {
  constructor(message = 'Resource not found') {
    super(message, 404);
  }
}

export class ConflictError extends CustomError {
  constructor(message = 'Resource already exists') {
    super(message, 409);
  }
}

export class ValidationError extends CustomError {
  constructor(message = 'Validation failed', details?: any) {
    super(message, 422, details);
  }
}

export class InternalServerError extends CustomError {
  constructor(message = 'Internal Server Error') {
    super(message, 500);
  }
}
