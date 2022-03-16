import assert from 'assert';
import { URL } from 'url';
import axios from 'axios';

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
    axios.create({ baseURL: baseUrl, timeout: 15000 })
  );

  return async function getPublicKey(keyId: string) {
    const promises = clients.map(client => client.get(keyId));
    const response = await Promise.race(promises);
    return response.data;
  };
}

export default createPublicKeyFetcher;
