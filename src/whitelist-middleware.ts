import assert from 'assert';
import { AsapAuthorizationError } from './errors';

export default function createAsapIssuerWhitelistMiddleware(authorizedIssuers) {
    assert.ok(Array.isArray(authorizedIssuers), 'authorizedIssuers must be an array');

    return function asapAuthorizationMiddleware(request, response, next) {
        const asapClaims = response.locals.asapClaims;

        if (asapClaims && authorizedIssuers.includes(asapClaims.iss)) {
            return next();
        }

        next(new AsapAuthorizationError('Unauthorized issuer or subject'));
    };
}
