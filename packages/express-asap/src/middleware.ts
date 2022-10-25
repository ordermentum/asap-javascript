import { Request, Response, NextFunction } from 'express';
import {
  createAsapAuthenticator,
  AuthenticatorOptions,
} from '@ordermentum/asap-core';
import { JwtPayload } from 'jsonwebtoken';

/**
 * Creates an express middleware to validate the authorization header
 * using the ASAP standard
 *
 * @param opts AuthenticatorOptions
 * @returns Express middleware function
 *
 */
export function createAsapAuthenticationMiddleware(opts: AuthenticatorOptions) {
  const authenticateAsapHeader = createAsapAuthenticator(opts);

  return function asapAuthenticationMiddleware(
    request: Request,
    _: Response,
    next: NextFunction
  ) {
    const authHeader = request.headers.authorization;
    if (authHeader) {
      return authenticateAsapHeader(authHeader)
        .then(asapClaims => {
          request.locals = request.locals ?? {};
          request.locals.asapClaims = asapClaims as JwtPayload;
          next();
        })
        .catch(error => {
          next(error);
        });
    }
    return next();
  };
}

export default createAsapAuthenticationMiddleware;
