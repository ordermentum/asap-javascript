import assert from "assert";
import { URL } from "url";

import httplease from "httplease";
import httpleaseCache from "httplease-cache";

export default function createPublicKeyFetcher({
  publicKeyBaseUrls,
  theCache,
}) {
  const validatedPublicKeyBaseUrls = parseUrlArray(publicKeyBaseUrls);
  assert.ok(
    validatedPublicKeyBaseUrls.length > 0,
    "At least one publicKeyBaseUrl is required"
  );

  const sharedCacheFilter = httpleaseCache.createCacheFilter({
    generateCacheKey,
    theCache,
  });
  function generateCacheKey(requestConfig) {
    return requestConfig.path; // this is always exactly equal to the keyId
  }

  const baseClient = httplease
    .builder()
    .withClientName("asapAuthenticationKeyFetcher")
    .withMethodGet()
    .withExpectStatus([200])
    .withBufferBodyResponseHandler()
    .withTimeout(15000)
    .withFilter(sharedCacheFilter);

  const clients = validatedPublicKeyBaseUrls.map((baseUrl) =>
    baseClient.withBaseUrl(baseUrl)
  );

  return async function getPublicKey(keyId) {
    const promises = clients.map((client) => client.withPath(keyId).send());
    const response = await anyPromise(promises);
    return response.body;
  };
}

function anyPromise(promises) {
  return new Promise((resolve, reject) => {
    let remaining = promises.length;
    promises.forEach((promise) =>
      promise.then(resolve, (err) => {
        --remaining;
        if (remaining === 0) {
          reject(err);
        }
      })
    );
  });
}

function parseUrlArray(array) {
  const urls = array.map((urlString) => new URL(urlString));

  assert.ok(
    urls.every((url) => url.protocol.startsWith("http")),
    "Only http(s) ASAP repositories are supported"
  );
  assert.ok(
    urls.every((url) => url.pathname.endsWith("/")),
    "ASAP repository URLs must end with a trailing slash"
  );

  return urls.map((url) => url.toString());
}
