import Hapi from '@hapi/hapi';
import Boom from '@hapi/boom';
import {
  createAsapAuthenticator,
  AuthenticatorOptions,
} from '@ordermentum/asap-core';

const implementation = (_server: Hapi.Server, options?: any) => {
  const authenticator = createAsapAuthenticator(options);

  const scheme = {
    authenticate: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
      if (!options)
        return h.unauthenticated(Boom.badRequest('Unknown Configuration'));

      const token = request?.headers?.authorization;

      if (token) {
        try {
          const payload = await authenticator(token);
          if (payload) {
            return h.authenticated({
              credentials: {},
              artifacts: { test: 1, asapClaims: payload },
            });
          }
          // eslint-disable-next-line no-empty
        } catch (e) {}
      }

      if (request.auth.mode === 'required') {
        return h.unauthenticated(Boom.unauthorized('asap'));
      }

      return h.continue;
    },
  };

  return scheme;
};

/**
 * Creates an hapi plugin to validate the authorization header
 * using the ASAP standard
 *
 *
 * @param opts AuthenticatorOptions
 *
 */
const register = (server: Hapi.Server, options: AuthenticatorOptions) => {
  server.auth.scheme('hapi-asap', implementation);
  server.auth.strategy('hapi-asap', 'hapi-asap', options);
};

const plugin: Hapi.Plugin<AuthenticatorOptions> = {
  register,
  pkg: { name: 'ASAP Authentication', version: '0.1.0' },
};

export { register, AuthenticatorOptions, plugin };

export default plugin;
