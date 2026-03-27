import  ResponseManager  from "./responseManager.js"

export class ApplicationError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.name = "ApplicationError";
    this.statusCode = statusCode || 400;
  }
}

export class ValidationError extends ApplicationError {
  constructor(message, statusCode) {
    super(message, statusCode);
    this.statusCode = 400;
    this.name = "ValidationError";
  }
}

export class NotFoundError extends ApplicationError {
  constructor(message, statusCode) {
    super(message, statusCode);
    this.statusCode = 404;
    this.name = "NotFoundError";
  }
}

export class AuthorizationError extends ApplicationError {
  constructor(message, statusCode) {
    super(message, statusCode);
    this.statusCode = 401;
    this.name = "AuthorizationError";
  }
}


export function errorHandler(err, req, res, next) {
  if (err.statusCode) {
    ResponseManager.error(res, err.name, err.message, err.statusCode);
  } else {
    ResponseManager.error(res, err.name || "Error", err.message || "Internal Server Error", 500);
  }

  if (!err.statusCode || err.statusCode >= 500) {
    console.error(err, req);
  }
}

