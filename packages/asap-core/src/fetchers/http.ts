import assert from 'assert';
import { URL } from 'url';
import axios from 'axios';
import cache from '../cache';
import { AsapAuthenticationError } from '../errors';

function parseUrlArray(array: string[]) {
  const urls = array.map(urlString => new URL(urlString));

  assert.ok(
    urls.every(url => url.protocol.startsWith('http')),
    'Only http(s) ASAP repositories are supported'
  );
  assert.ok(
    urls.every(url => url.pathname.endsWith('/')),
    'ASAP repository URLs must end with a trailing slash'
  );

  return urls.map(url => url.toString());
}

export function createPublicKeyFetcher({
  publicKeyBaseUrls,
}: {
  publicKeyBaseUrls: string[];
}) {
  const validatedPublicKeyBaseUrls = parseUrlArray(publicKeyBaseUrls);
  assert.ok(
    validatedPublicKeyBaseUrls.length > 0,
    'At least one publicKeyBaseUrl is required'
  );

  const clients = validatedPublicKeyBaseUrls.map(baseUrl =>
    axios.create({
      baseURL: baseUrl,
      headers: {
        Accept: 'application/x-pem-file',
      },
      timeout: 15000,
    })
  );

  return async function getPublicKey(keyId: string): Promise<string> {
    let value = cache.get<string>(keyId);

    if (value) {
      return value;
    }

    const promises = clients.map(client => client.get<string>(keyId));
    const response = await Promise.any(promises);
    if (response.status === 200) {
      value = response.data;
      cache.set(keyId, value);
      return value;
    }

    throw new AsapAuthenticationError('failed to fetch public key');
  };
}

export default createPublicKeyFetcher;
