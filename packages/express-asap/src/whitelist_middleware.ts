import assert from 'assert';
import { Request, Response, NextFunction } from 'express';
import { AsapAuthorizationError } from '@ordermentum/asap-core';

/**
 * Creates an express middleware to restrict requests to whitelisted issuers
 *
 *
 * @param authorizedIssuers - string array of known issuers
 * @returns Express middleware function
 *
 */
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
