import crypto from 'crypto';
import jsonWebToken, { SignOptions } from 'jsonwebtoken';

function assertDefined(value: string | null | undefined, message: string) {
  if (value === undefined || value === null || value === '') {
    throw new Error(message);
  }
}

export function createAuthHeaderGenerator(jwtConfig: {
  privateKey: string;
  keyId: string;
  issuer: string;
  audience: string;
  tokenExpiryMs?: number;
  tokenMaxAgeMs?: number;
  additionalClaims?: any;
  subject?: string;
}) {
  assertDefined(jwtConfig.privateKey, 'jwtConfig.privateKey must be set');
  assertDefined(jwtConfig.keyId, 'jwtConfig.keyId must be set');
  assertDefined(jwtConfig.issuer, 'jwtConfig.issuer must be set');
  assertDefined(jwtConfig.audience, 'jwtConfig.audience must be set');

  const privateKey = jwtConfig.privateKey
    .replace(/\\n/g, '\n')
    .replace(/"/g, '');

  // The max age is less than the expiry so that we don't ever reuse a nearly expired token
  const tokenExpiryMs = jwtConfig.tokenExpiryMs || 10 * 60 * 1000;
  const tokenMaxAgeMs = jwtConfig.tokenMaxAgeMs || 9 * 60 * 1000;

  const additionalClaims = jwtConfig.additionalClaims || {};

  let lastUpdated = 0;
  let authHeader: string = '';

  function isExpired(now: number) {
    const tokenAge = now - lastUpdated;
    return tokenAge > tokenMaxAgeMs;
  }

  function generateStandardClaims(now: number) {
    return {
      aud: jwtConfig.audience,
      iss: jwtConfig.issuer,
      sub: jwtConfig.subject || jwtConfig.issuer,
      iat: Math.floor(now / 1000),
      nbf: Math.floor(now / 1000),
      exp: Math.floor((now + tokenExpiryMs) / 1000),
      jti: crypto.randomBytes(20).toString('hex'),
    };
  }

  function getOrGenerateAuthHeader() {
    const now = Date.now();
    if (!isExpired(now)) {
      return authHeader;
    }
    const claims = {
      ...generateStandardClaims(now),
      ...additionalClaims,
    };
    const options: SignOptions = {
      algorithm: 'RS256',
      header: {
        alg: 'RS256',
        kid: jwtConfig.keyId,
      },
    };
    authHeader = `Bearer ${jsonWebToken.sign(claims, privateKey, options)}`;
    lastUpdated = now;
    return authHeader;
  }

  // Fail if we cannot generate an auth header
  getOrGenerateAuthHeader();

  return getOrGenerateAuthHeader;
}

export default createAuthHeaderGenerator;
