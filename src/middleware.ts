
import createAsapAuthenticator from './authenticator';

export default function createAsapAuthenticationMiddleware(opts: ) {
    const authenticateAsapHeader = createAsapAuthenticator(opts);

    return function asapAuthenticationMiddleware(request, response, next) {
        const authHeader = request.headers.authorization;
        return authenticateAsapHeader(authHeader)
            .then((asapClaims) => {
                response.locals.asapClaims = asapClaims;
                next();
            })
            .catch((error) => {
                next(error);
            });
    };
}


