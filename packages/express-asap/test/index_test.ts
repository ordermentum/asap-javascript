import { describe, beforeEach } from 'mocha';
import { expect } from 'chai';
import express from 'express';
import request from 'supertest';
import { createAuthHeaderGenerator } from '@ordermentum/asap-core';
import { publicKey, privateKeyPem } from '@ordermentum/asap-test-helpers';
import createAsapAuthenticationMiddleware from '../src/middleware';
import createAsapIssuerWhitelistMiddleware from '../src/whitelist_middleware';

const app = express();
app.use(
  createAsapAuthenticationMiddleware({
    keyLoader: (_key: string) => Promise.resolve(publicKey),
    resourceServerAudience: 'test',
    maxLifeTimeSeconds: 60,
  })
);

app.get('/', (_req, res) => {
  res.status(200);

  if (res?.locals?.asapClaims) {
    return res.send(res.locals.asapClaims.aud);
  }
  return res.send('OK');
});

const agent = request.agent(app);

describe('middleware', () => {
  it('accepts invalid header', async () => {
    const res = await agent.get('/');
    expect(res.status).to.equal(200);
    expect(res.text).to.equal('OK');
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
    const res = await agent.get('/').set('Authorization', authHeader);
    expect(res.status).to.equal(200);
    console.log('🐰🐰🐰🐰🐰🐰🐰🐰🐰🐰🐰🐰🐰🐰🐰🐰🐰🐰🐰🐰🐰🐰🐰🐰');
    console.log('res:', res);
    expect(res.text).to.equal('OK');
  });

  it('accepts invalid token', async () => {
    const jwtConfig = {
      privateKey: privateKeyPem,
      issuer: 'an-issuer',
      keyId: 'an-issuer/the-keyid',
      audience: 'another',
      tokenExpiryMs: 60 * 1000,
    };

    const authHeader = createAuthHeaderGenerator(jwtConfig)();
    const res = await agent.get('/').set('Authorization', authHeader);
    expect(res.status).to.equal(401);
  });

  it('accepts invalid header', async () => {
    const jwtConfig = {
      privateKey: privateKeyPem,
      issuer: 'test',
      keyId: 'test/the-keyid',
      audience: 'test',
      tokenExpiryMs: 60 * 1000,
    };
    app.use(createAsapIssuerWhitelistMiddleware(['an-issuer']));
    app.get('/protected', (_req, res) => {
      res.status(200);
      return res.send('OK');
    });

    const authHeader = createAuthHeaderGenerator(jwtConfig)();
    const res = await agent.get('/protected').set('Authorization', authHeader);
    expect(res.status).to.equal(401);
  });
});
