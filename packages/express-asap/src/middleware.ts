import { Request, Response, NextFunction } from 'express';
import {
  createAsapAuthenticator,
  AuthenticatorOptions,
} from '@ordermentum/asap-core';
import { JwtPayload } from 'jsonwebtoken';

export type ExpressAsapMiddlewareOptions = AuthenticatorOptions & {
  /**
   * Set if you want this middleware 
   * to invoke an error if it fails to authenticate
   * instead of passing the request on
   * @default false
   * @example - Routes that use this have to check for the presence of claims on the request
   * 
   * //handler
   * if(!req.locals?.asapClaims) // Can check presence of nested claims
   *  res.sendStatus(401); 
   * 
   */
  failEarly?: boolean;
}

/**
 * Creates an express middleware to validate the authorization header
 * using the ASAP standard
 *
 * @param opts AuthenticatorOptions
 * @returns Express middleware function
 *
 */
export function createAsapAuthenticationMiddleware(opts: ExpressAsapMiddlewareOptions) {
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
          if(opts.failEarly)
            next(error);
          else
            next();
        });
    }
    return next();
  };
}

export default createAsapAuthenticationMiddleware;
