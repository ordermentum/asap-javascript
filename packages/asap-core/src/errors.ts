const ASAP_INVALID_TOKEN = 'asap-invalid-token';
const ASAP_UNAUTHORIZED_ISSUER = 'asap-unauthorized-issuer';

export class AsapError extends Error {
  errorKey?: string;

  statusCode: number;

  logLevel: string;

  cause?: any | null;

  constructor(message: string, cause?: any | null) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = 401;
    this.logLevel = 'warn';
    if (cause) {
      this.cause = cause;
    }
  }
}

export class AsapAuthenticationError extends AsapError {
  constructor(message: string, cause?: any | null) {
    super(message, cause);
    this.errorKey = ASAP_INVALID_TOKEN;
  }
}

export class AsapAuthorizationError extends AsapError {
  constructor(message: string, cause?: any | null) {
    super(message, cause);
    this.errorKey = ASAP_UNAUTHORIZED_ISSUER;
  }
}
