import assert from 'assert';
import { Request, Response, NextFunction } from 'express';
import { AsapAuthorizationError } from './errors';

export function createAsapIssuerWhitelistMiddleware(
  authorizedIssuers: string[]
) {
  assert.ok(
    Array.isArray(authorizedIssuers),
    'authorizedIssuers must be an array'
  );

  return function asapAuthorizationMiddleware(
    _request: Request,
    response: Response,
    next: NextFunction
  ) {
    const { asapClaims } = response.locals;

    if (asapClaims && authorizedIssuers.includes(asapClaims.iss)) {
      return next();
    }

    return next(new AsapAuthorizationError('Unauthorized issuer or subject'));
  };
}

export default createAsapIssuerWhitelistMiddleware;
