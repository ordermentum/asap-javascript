import assert from 'assert';
import jsonWebToken, { JwtPayload, Algorithm } from 'jsonwebtoken';
import axios from 'axios';
import createPublicKeyFetcher from './fetchers/http';
import { AsapAuthenticationError } from './errors';
import { createTestPublicKeyFetcher } from './fetchers/file';

const ALLOWED_ALGORITHMS: Algorithm[] = [
  'RS256',
  'RS384',
  'RS512',
  'ES256',
  'ES384',
  'ES512',
  'PS256',
  'PS384',
  'PS512',
];
const CLOCK_TOLERANCE_SECONDS =
  parseInt(process.env.ASAP_SERVER_LEEWAY_SECONDS ?? '', 10) || 30;
const DEFAULT_MAX_LIFETIME_SECONDS = 3600;

function assertAsap(
  condition: boolean,
  message: string,
  cause: any | null = null
) {
  if (!condition) {
    throw new AsapAuthenticationError(message, cause);
  }
}

function validateIssuerAndKeyId(issuer: string, keyId: string) {
  const pattern = /^[\w.\-+/]*$/;
  const keyIdComponents = keyId.split('/');

  assertAsap(!!keyId && pattern.test(keyId), 'jwt has invalid keyId', {
    keyId,
  });
  assertAsap(!!issuer && pattern.test(issuer), 'jwt has invalid issuer', {
    issuer,
  });

  assertAsap(
    !keyIdComponents.includes(''),
    'jwt has keyId with invalid path component',
    { keyId }
  );
  assertAsap(
    !keyIdComponents.includes('.'),
    'jwt has keyId with invalid path component',
    { keyId }
  );
  assertAsap(
    !keyIdComponents.includes('..'),
    'jwt has keyId with invalid path component',
    { keyId }
  );
  assertAsap(
    keyId.startsWith(`${issuer}/`),
    'jwt has keyId which is invalid for issuer',
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

  assertAsap(iat < exp, 'jwt issued after expiry', { iat, exp });
  assertAsap(
    iat + maxLifeTimeSeconds >= exp,
    `jwt has lifetime greater than ${maxLifeTimeSeconds} seconds`,
    { iat, maxLifeTimeSeconds, exp }
  );

  assertAsap(
    (iat && iat <= Date.now() / 1000 + CLOCK_TOLERANCE_SECONDS) === true,
    'jwt not active',
    { iat }
  );

  if (nbf) {
    assertAsap(nbf < exp, 'jwt was never valid', { nbf, exp });
    assertAsap(nbf >= iat, 'jwt valid before issued', { nbf, iat });
  }
}

export type KeyLoader = (keyId: string) => Promise<string>;
export type AuthenticatorOptions = {
  resourceServerAudience: string;
  maxLifeTimeSeconds: number;
  /**
   * Insecure mode forces the authenticator to use a static public key for decryption
   * This mode helps services to test authentication flows
   * @default false
   */
  insecureMode?: boolean;
} & {
  publicKeyBaseUrls?: string[];
  keyLoader?: KeyLoader;
};

export function createAsapAuthenticator({
  publicKeyBaseUrls,
  keyLoader,
  resourceServerAudience,
  maxLifeTimeSeconds = DEFAULT_MAX_LIFETIME_SECONDS,
  insecureMode = false,
}: AuthenticatorOptions) {
  assert.ok(resourceServerAudience, 'resourceServerAudience must be set');

  if (insecureMode) keyLoader = createTestPublicKeyFetcher(); // eslint-disable-line no-param-reassign

  let getPublicKey: KeyLoader;

  if (keyLoader) {
    getPublicKey = keyLoader;
  } else {
    assert.ok(publicKeyBaseUrls, 'publicKeyBaseUrls must be set');
    getPublicKey = createPublicKeyFetcher({
      publicKeyBaseUrls,
    });
  }

  const verifyOptions = {
    algorithms: ALLOWED_ALGORITHMS,
    clockTolerance: CLOCK_TOLERANCE_SECONDS,
    audience: resourceServerAudience,
  };

  async function getVerifiedAsapClaims(authHeader: string) {
    if (!authHeader) {
      return null;
    }

    const [scheme, jwtString] = authHeader.split(' ');
    if (scheme !== 'Bearer') {
      return null;
    }

    const unverifiedJwt = jsonWebToken.decode(jwtString, { complete: true });

    if (!unverifiedJwt) {
      throw new AsapAuthenticationError('jwt could not be decoded');
    }

    const payload = unverifiedJwt.payload as { iss?: string };
    const keyId = unverifiedJwt.header.kid;
    const issuer = payload.iss ?? '';

    if (issuer === '') {
      // most likely not an ASAP token as it doesn't have an issuer for us to look up against
      return null;
    }

    if (!keyId) {
      // most likely not an ASAP token as it doesn't have a keyId for us to look up against
      return null;
    }

    validateIssuerAndKeyId(issuer, keyId);
    const publicKey = await getPublicKey(keyId);
    const asapClaims = jsonWebToken.verify(jwtString, publicKey, verifyOptions);
    validateTimeClaims(asapClaims as JwtPayload, maxLifeTimeSeconds);
    return asapClaims;
  }

  return async function authenticateAsapHeader(authHeader: string) {
    try {
      return await getVerifiedAsapClaims(authHeader);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new AsapAuthenticationError('failed to fetch public key', error);
      }
      if (error instanceof jsonWebToken.JsonWebTokenError) {
        const e = error as jsonWebToken.JsonWebTokenError;
        throw new AsapAuthenticationError(e.message);
      }
      throw error;
    }
  };
}

export default createAsapAuthenticator;
