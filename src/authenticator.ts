import assert from "assert";
import jsonWebToken, { JwtPayload, Algorithm } from "jsonwebtoken";

import axios from "axios";
import createPublicKeyFetcher from "./fetch";
import { AsapAuthenticationError } from "./errors";

const ALLOWED_ALGORITHMS: Algorithm[] = [
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
const CLOCK_TOLERANCE_SECONDS =
  parseInt(process.env.ASAP_SERVER_LEEWAY_SECONDS ?? "", 10) || 30;
const DEFAULT_MAX_LIFETIME_SECONDS = 3600;

export default function createAsapAuthenticator({
  publicKeyBaseUrls,
  resourceServerAudience,
  maxLifeTimeSeconds = DEFAULT_MAX_LIFETIME_SECONDS,
}: {
  publicKeyBaseUrls: string[];
  resourceServerAudience: string;
  maxLifeTimeSeconds: number;
}) {
  assert.ok(publicKeyBaseUrls, "publicKeyBaseUrls must be set");
  assert.ok(resourceServerAudience, "resourceServerAudience must be set");

  const getPublicKeyFn = createPublicKeyFetcher({
    publicKeyBaseUrls,
  });

  const verifyOptions = {
    algorithms: ALLOWED_ALGORITHMS,
    clockTolerance: CLOCK_TOLERANCE_SECONDS,
    audience: resourceServerAudience,
  };

  return async function authenticateAsapHeader(authHeader: string) {
    try {
      return await getVerifiedAsapClaims(authHeader);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new AsapAuthenticationError("failed to fetch public key", error);
      }
      if (error instanceof jsonWebToken.JsonWebTokenError) {
        let e = error as jsonWebToken.JsonWebTokenError;
        throw new AsapAuthenticationError(e.message);
      }
      throw error;
    }
  };

  async function getVerifiedAsapClaims(authHeader: string) {
    if (!authHeader) {
      return;
    }

    const [scheme, jwtString] = authHeader.split(" ");
    if (scheme !== "Bearer") {
      return;
    }

    const unverifiedJwt = jsonWebToken.decode(jwtString, { complete: true });

    if (!unverifiedJwt) {
      throw new AsapAuthenticationError("jwt could not be decoded");
    }

    const payload = unverifiedJwt.payload as { iss?: string };
    const keyId = unverifiedJwt.header.kid;
    const issuer = payload.iss ?? '';

    if (!keyId) {
      throw new AsapAuthenticationError("mising kid header");
    }

    validateIssuerAndKeyId(issuer, keyId);
    const publicKey = await getPublicKeyFn(keyId);
    const asapClaims = jsonWebToken.verify(jwtString, publicKey, verifyOptions);
    validateTimeClaims(asapClaims as JwtPayload, maxLifeTimeSeconds);
    return asapClaims;
    }
  }


function validateIssuerAndKeyId(issuer: string, keyId: string) {
  const pattern = /^[\w.\-+/]*$/;
  const keyIdComponents = keyId.split("/");

  assertAsap(!!keyId && pattern.test(keyId), "jwt has invalid keyId", {
    keyId,
  });
  assertAsap(!!issuer && pattern.test(issuer), "jwt has invalid issuer", {
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

function validateTimeClaims(
  { iat, nbf, exp }: { iat?: number; nbf?: number; exp?: number },
  maxLifeTimeSeconds: number
) {
if (!iat || !exp) {
  throw new AsapAuthenticationError('invalid jwt missing headers'); 
}

  assertAsap(iat < exp, "jwt issued after expiry", { iat, exp });
  assertAsap(
    iat + maxLifeTimeSeconds >= exp,
    `jwt has lifetime greater than ${maxLifeTimeSeconds} seconds`,
    { iat, maxLifeTimeSeconds, exp }
  );

  assertAsap(
    (iat && iat <= Date.now() / 1000 + CLOCK_TOLERANCE_SECONDS) === true,
    "jwt not active",
    { iat }
  );

  if (nbf) {
    assertAsap(nbf < exp, "jwt was never valid", { nbf, exp });
    assertAsap(nbf >= iat, "jwt valid before issued", { nbf, iat });
  }
}

function assertAsap(
  condition: boolean,
  message: string,
  cause: any | null = null
) {
  if (!condition) {
    throw new AsapAuthenticationError(message, cause);
  }
}

module.exports = createAsapAuthenticator;
