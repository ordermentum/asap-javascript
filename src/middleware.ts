import { Request, Response, NextFunction } from "express";
import createAsapAuthenticator from "./authenticator";

export default function createAsapAuthenticationMiddleware(opts: any) {
  const authenticateAsapHeader = createAsapAuthenticator(opts);

  return function asapAuthenticationMiddleware(
    request: Request,
    response: Response,
    next: NextFunction
  ) {
    const authHeader = request.headers.authorization;
    if (authHeader) {
      return authenticateAsapHeader(authHeader)
        .then((asapClaims) => {
          response.locals.asapClaims = asapClaims;
          next();
        })
        .catch((error) => {
          next(error);
        });
    }
    return next();
  };
}
