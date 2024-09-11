const ASAP_INVALID_TOKEN = 'asap-invalid-token';
const ASAP_UNAUTHORIZED_ISSUER = 'asap-unauthorized-issuer';

const ASAP_ERROR_CLASS_SYMBOL = Symbol('asapError');

export const isAsapError = (error: any) =>
  error !== undefined &&
  error !== null &&
  error.isAsapError === ASAP_ERROR_CLASS_SYMBOL;

export class AsapError extends Error {
  errorKey?: string;

  statusCode: number;

  logLevel: string;

  cause?: Error | string | null;

  isAsapError: symbol;

  constructor(message: string, cause?: Error | string | null) {
    super(message);
    this.name = this.constructor.name;
    this.isAsapError = ASAP_ERROR_CLASS_SYMBOL;
    this.statusCode = 401;
    this.logLevel = 'warn';
    if (cause) {
      this.cause = cause;
    }
  }

  toString = () =>
    [
      this.errorKey ? `[${this.errorKey}]` : '',
      `(${this.statusCode || -1})`,
      `${this.message}`,
      this.cause ? `: (${this.cause})` : '',
    ]
      .filter(s => !!s)
      .join('');
}

export class AsapAuthenticationError extends AsapError {
  constructor(message: string, cause?: Error | string | null) {
    super(message, cause);
    this.errorKey = ASAP_INVALID_TOKEN;
  }
}

export class AsapAuthorizationError extends AsapError {
  constructor(message: string, cause?: Error | string | null) {
    super(message, cause);
    this.errorKey = ASAP_UNAUTHORIZED_ISSUER;
  }
}
