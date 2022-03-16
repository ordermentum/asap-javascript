import assert from "assert";
import { Request, Response, NextFunction } from "express";
import { AsapAuthorizationError } from "./errors";

export default function createAsapIssuerWhitelistMiddleware(
  authorizedIssuers: string[]
) {
  assert.ok(
    Array.isArray(authorizedIssuers),
    "authorizedIssuers must be an array"
  );

  return function asapAuthorizationMiddleware(
    _request: Request,
    response: Response,
    next: NextFunction
  ) {
    const asapClaims = response.locals.asapClaims;

    if (asapClaims && authorizedIssuers.includes(asapClaims.iss)) {
      return next();
    }

    next(new AsapAuthorizationError("Unauthorized issuer or subject"));
  };
}
