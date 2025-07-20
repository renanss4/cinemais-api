export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    statusCode: number,
    code: string,
    isOperational = true
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;

    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400, "VALIDATION_ERROR");
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 404, "NOT_FOUND");
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, "CONFLICT");
  }
}

export class ServerError extends AppError {
  constructor(message: string = "Server operation failed") {
    super(message, 500, "SERVER_ERROR");
  }
}
