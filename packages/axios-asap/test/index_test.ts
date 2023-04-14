import { describe, beforeEach } from 'mocha';
import axios from 'axios';
import moxios from 'moxios';
import { expect } from 'chai';
import { privateKeyPem } from '@ordermentum/asap-test-helpers';
import { createAsapInterceptor, createClient } from '../src';

describe('createAuthHeaderGenerator', () => {
  let jwtConfig;

  beforeEach(() => {
    jwtConfig = {
      privateKey: privateKeyPem,
      issuer: 'an-issuer',
      keyId: 'the-keyid',
      audience: 'an-audience',
    };
  });

  it('sets the header', async () => {
    const client = axios.create();
    moxios.install(client);
    client.interceptors.request.use(createAsapInterceptor(jwtConfig));
    moxios.stubRequest('/say/hello', {
      status: 200,
      responseText: 'hello',
    });

    const res = await client.get('/say/hello');
    expect(res.status).to.equal(200);
    expect(Object.keys(res?.config?.headers ?? {})).to.include('Authorization');
    expect(res?.config?.headers?.Authorization).to.include('Bearer');
  });

  it('creates a client', async () => {
    const client = createClient(
      {
        service: 'the-keyid',
        issuer: 'an-issuer',
        publicKey: 'public-key',
        privateKey: privateKeyPem,
      },
      {
        insecureMode: false,
        additionalClaims: {
          admin: true,
          userId: '123',
        },
      }
    );

    moxios.install(client);
    moxios.stubRequest('/say/hello', {
      status: 200,
      responseText: 'hello',
    });

    const res = await client.get('/say/hello');
    expect(res.status).to.equal(200);
    expect(Object.keys(res?.config?.headers ?? {})).to.include('Authorization');
    expect(res?.config?.headers?.Authorization).to.include('Bearer');
  });
});
