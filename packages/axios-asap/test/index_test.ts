import { describe, beforeEach } from 'mocha';
import axios from 'axios';
import moxios from 'moxios';
import { expect } from 'chai';
import { privateKeyPem } from '@ordermentum/asap-test-helpers';
import { createAsapInterceptor } from '../src';

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
    expect(Object.keys(res.config.headers)).to.include('Authorization');
    expect(res.config.headers.Authorization).to.include('Bearer');
  });
});
