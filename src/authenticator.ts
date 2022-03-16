import assert from "assert";
import jsonWebToken from "jsonwebtoken";
import httplease from "httplease";

import createPublicKeyFetcher from "./fetch";
import { AsapAuthenticationError } from "./errors";

const ALLOWED_ALGORITHMS = [
  "RS256",
  "RS384",
  "RS512",
  "ES256",
  "ES384",
  "ES512",
  "PS256",
  "PS384",
  "PS512",
];
const CLOCK_TOLERANCE_SECONDS = process.env.ASAP_SERVER_LEEWAY_SECONDS || 30;
const DEFAULT_MAX_LIFETIME_SECONDS = 3600;

export default function createAsapAuthenticator({
  publicKeyBaseUrls,
  resourceServerAudience,
  theCache,
  maxLifeTimeSeconds = DEFAULT_MAX_LIFETIME_SECONDS,
}) {
  assert.ok(publicKeyBaseUrls, "publicKeyBaseUrls must be set");
  assert.ok(resourceServerAudience, "resourceServerAudience must be set");

  const getPublicKeyFn = createPublicKeyFetcher({
    publicKeyBaseUrls,
    theCache,
  });

  const verifyOptions = {
    algorithms: ALLOWED_ALGORITHMS,
    clockTolerance: CLOCK_TOLERANCE_SECONDS,
    audience: resourceServerAudience,
  };

  return async function authenticateAsapHeader(authHeader) {
    try {
      return await getVerifiedAsapClaims(authHeader);
    } catch (error) {
      if (error instanceof httplease.errors.HttpleaseError) {
        throw new AsapAuthenticationError("failed to fetch public key", error);
      }
      if (error instanceof jsonWebToken.JsonWebTokenError) {
        throw new AsapAuthenticationError(error.message);
      }
      throw error;
    }
  };

  async function getVerifiedAsapClaims(authHeader) {
    if (!authHeader) {
      return;
    }

    const [scheme, jwtString] = authHeader.split(" ");
    if (scheme !== "Bearer") {
      return;
    }

    const unverifiedJwt = jsonWebToken.decode(jwtString, { complete: true });
    assertAsap(unverifiedJwt, "jwt could not be decoded");
    const keyId = unverifiedJwt.header.kid;
    const issuer = unverifiedJwt.payload.iss;

    validateIssuerAndKeyId(issuer, keyId);

    const publicKey = await getPublicKeyFn(keyId);

    const asapClaims = jsonWebToken.verify(jwtString, publicKey, verifyOptions);
    validateTimeClaims(asapClaims, maxLifeTimeSeconds);
    return asapClaims;
  }
}

function validateIssuerAndKeyId(issuer, keyId) {
  const pattern = /^[\w.\-+/]*$/;
  const keyIdComponents = typeof keyId === "string" && keyId.split("/");

  assertAsap(keyId && pattern.test(keyId), "jwt has invalid keyId", { keyId });
  assertAsap(issuer && pattern.test(issuer), "jwt has invalid issuer", {
    issuer,
  });
  assertAsap(
    !keyIdComponents.includes(""),
    "jwt has keyId with invalid path component",
    { keyId }
  );
  assertAsap(
    !keyIdComponents.includes("."),
    "jwt has keyId with invalid path component",
    { keyId }
  );
  assertAsap(
    !keyIdComponents.includes(".."),
    "jwt has keyId with invalid path component",
    { keyId }
  );
  assertAsap(
    keyId.startsWith(issuer + "/"),
    "jwt has keyId which is invalid for issuer",
    { keyId, issuer }
  );
}

function validateTimeClaims({ iat, nbf, exp }, maxLifeTimeSeconds) {
  assertAsap(iat < exp, "jwt issued after expiry", { iat, exp });
  assertAsap(
    iat + maxLifeTimeSeconds >= exp,
    `jwt has lifetime greater than ${maxLifeTimeSeconds} seconds`,
    { iat, maxLifeTimeSeconds, exp }
  );

  assertAsap(
    iat <= Date.now() / 1000 + CLOCK_TOLERANCE_SECONDS,
    "jwt not active",
    { iat }
  );

  if (nbf) {
    assertAsap(nbf < exp, "jwt was never valid", { nbf, exp });
    assertAsap(nbf >= iat, "jwt valid before issued", { nbf, iat });
  }
}

function assertAsap(condition, message, cause) {
  if (!condition) {
    throw new AsapAuthenticationError(message, cause);
  }
}

module.exports = createAsapAuthenticator;
