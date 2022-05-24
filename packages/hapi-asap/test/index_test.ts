import { describe, beforeEach } from 'mocha';
import { expect } from 'chai';
import { createAuthHeaderGenerator } from '@ordermentum/asap-core';
import { publicKey, privateKeyPem } from '@ordermentum/asap-test-helpers';
import Hapi from '@hapi/hapi';
import registerPlugin from '../src/middleware';

async function init() {
  const server = Hapi.server({
    port: 3000,
    host: 'localhost',
  });

  await server.register(registerPlugin);

  server.auth.strategy('asap', 'hapi-asap', {
    keyLoader: (_key: string) => Promise.resolve(publicKey),
    resourceServerAudience: 'test',
    maxLifeTimeSeconds: 60,
  });

  server.route({
    method: 'GET',
    path: '/test',
    options: {
      auth: {
        mode: 'optional',
        strategy: 'asap',
      },
    },
    handler(request, h) {
      const { asapClaims } = request.auth.artifacts ?? {};

      if (!asapClaims) {
        return `Ok`;
      }

      return `${asapClaims?.aud}`;
    },
  });

  server.route({
    method: 'GET',
    options: {
      auth: {
        mode: 'required',
        strategy: 'asap',
      },
    },
    path: '/required',
    handler(request, h) {
      const { asapClaims } = request.auth.artifacts ?? {};
      return `test ${asapClaims?.aud}`;
    },
  });
  await server.initialize();
  return server;
}

describe('middleware', () => {
  let server: Hapi.Server;

  beforeEach(async () => {
    server = await init();
  });

  afterEach(async () => {
    await server.stop();
  });

  it('accepts no header', async () => {
    const res = await server.inject({
      method: 'get',
      url: '/test',
    });
    expect(res.statusCode).to.equal(200);
    expect(res.result).to.equal('Ok');
  });

  it('accepts invalid header', async () => {
    const res = await server.inject({
      method: 'get',
      url: '/test',
      headers: {
        Authorization: '1234',
      },
    });
    expect(res.statusCode).to.equal(200);
    expect(res.result).to.equal('Ok');
  });

  it('accepts valid optional header', async () => {
    const jwtConfig = {
      privateKey: privateKeyPem,
      issuer: 'an-issuer',
      keyId: 'an-issuer/the-keyid',
      audience: 'test',
      tokenExpiryMs: 60 * 1000,
    };

    const authHeader = createAuthHeaderGenerator(jwtConfig)();
    const res = await server.inject({
      method: 'get',
      url: '/test',
      headers: {
        Authorization: authHeader,
      },
    });
    expect(res.statusCode).to.equal(200);
    expect(res.result).to.equal('test');
  });

  it('throws error', async () => {
    const res = await server.inject({
      method: 'get',
      url: '/required',
    });
    expect(res.statusCode).to.equal(401);
  });

  it('accepts valid header', async () => {
    const jwtConfig = {
      privateKey: privateKeyPem,
      issuer: 'an-issuer',
      keyId: 'an-issuer/the-keyid',
      audience: 'test',
      tokenExpiryMs: 60 * 1000,
    };

    const authHeader = createAuthHeaderGenerator(jwtConfig)();
    const res = await server.inject({
      method: 'get',
      url: '/required',
      headers: {
        Authorization: authHeader,
      },
    });
    expect(res.statusCode).to.equal(200);
    expect(res.result).to.equal('test test');
  });
});
