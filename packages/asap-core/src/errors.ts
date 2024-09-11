const ASAP_INVALID_TOKEN = 'asap-invalid-token';
const ASAP_UNAUTHORIZED_ISSUER = 'asap-unauthorized-issuer';

export class AsapError extends Error {
  errorKey?: string;

  statusCode: number;

  logLevel: string;

  cause?: Error | string | null;

  constructor(message: string, cause?: any | null) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = 401;
    this.logLevel = 'warn';
    if (cause) {
      this.cause = cause.toString();
    }
  }

  toString = () =>
    [
      this.errorKey ? `[${this.errorKey}]` : '',
      `(${this.statusCode || -1}),
      ${this.message}`,
      this.cause ? `: (${this.cause})` : '',
    ]
      .filter(s => s!!)
      .join('');
}

export class AsapAuthenticationError extends AsapError {
  constructor(message: string, cause?: Error | string | null) {
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
