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

  it('the cache is aware of headers and returns different clients for them', () => {
    const client1 = createClient(
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
      },
      {
        headers: {
          'x-custom-header': '1',
        },
      }
    );
    const client2 = createClient(
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
      },
      {
        headers: {
          'x-custom-header': '2',
        },
      }
    );
    expect(client1).to.not.equal(client2);
    expect(client1.defaults.headers['x-custom-header']).to.equal('1');
    expect(client2.defaults.headers['x-custom-header']).to.equal('2');
  });

  it('the cache returns the same client if the headers match', () => {
    const client1 = createClient(
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
      },
      {
        headers: {
          'x-custom-header': '1',
        },
      }
    );
    const client2 = createClient(
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
      },
      {
        headers: {
          'x-custom-header': '1',
        },
      }
    );
    expect(client1).to.equal(client2);
    expect(client1.defaults.headers['x-custom-header']).to.equal('1');
    expect(client2.defaults.headers['x-custom-header']).to.equal('1');
  })
});
