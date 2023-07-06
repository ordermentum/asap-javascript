import Hapi from '@hapi/hapi';
import Boom from '@hapi/boom';
import {
  createAsapAuthenticator,
  AuthenticatorOptions,
} from '@ordermentum/asap-core';
import { getAdminAuth } from '@ordermentum/auth-driver';
import { HapiAuthPluginOptions, createHapiAuthPlugin } from '@ordermentum/auth-middleware';
import { JwtPayload } from 'jsonwebtoken';

const implementation = (_server: Hapi.Server, options?: any) => {
  const authenticator = createAsapAuthenticator(options);

  const scheme = {
    authenticate: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
      if (!options)
        return h.unauthenticated(Boom.badRequest('Unknown Configuration'));

      const token = request?.headers?.authorization;

      if (token) {
        try {
          const payload = await authenticator(token) as JwtPayload;
          const { admin, userId } = payload;
          if (payload) {
            return h.authenticated({
              credentials: {},
              artifacts: {
                asapClaims: payload,
                auth: admin && userId ? getAdminAuth(userId) : null
              },
            });
          }
          // eslint-disable-next-line no-empty
        } catch (e) { }
      }

      if (request.auth.mode === 'required') {
        return h.unauthenticated(Boom.unauthorized('asap'));
      }

      return h.continue;
    },
  };

  return scheme;
};

type HapiAuthenticator = AuthenticatorOptions & {
  userAuth?: HapiAuthPluginOptions
}

/**
 * Creates an hapi plugin to validate the authorization header
 * using the ASAP standard and supports optional fallback to user authorization
 *
 * It registers the following strategies:
 * - `asap` - validates the authorization header using the ASAP standard
 * - `auth` - validates the authorization header using the user authorization standard
 * - `default` - validates the authorization header using the ASAP standard and falls back to user authorization if user auth options are passed
 *
 * @param opts AuthenticatorOptions
 *
 */
const register = async (
  server: Hapi.Server,
  options: HapiAuthenticator
): Promise<void> => {
  // Asap strategy
  server.auth.scheme('asap', implementation);
  server.auth.strategy('asap', 'asap', options);

  // User auth strategy
  const userAuthMiddleware = options.userAuth ? createHapiAuthPlugin({
    ...options.userAuth,
    strategyName: 'auth'
  }) : () => { };
  userAuthMiddleware(server);

  server.auth.scheme('default', () => ({
    authenticate: async (request, reply) => {
      const strategies = ['asap', options?.userAuth ? 'auth' : null];
      for (const strategy of strategies) {
        if (!strategy) continue;
        const credentials = await server.auth
          .test(strategy, request)
          .catch(_ => null);
        if (credentials) return reply.authenticated(credentials);
      }
      return reply.unauthenticated(Boom.unauthorized());
    },
  }));
  server.auth.strategy('default', 'default');
  server.auth.default('default');
};

export const plugin: Hapi.Plugin<HapiAuthenticator> = {
  register,
  pkg: { name: 'ASAP Authentication', version: '0.1.0' },
};

export default plugin;
