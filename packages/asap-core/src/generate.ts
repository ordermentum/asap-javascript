import crypto from 'crypto';
import jsonWebToken, { SignOptions } from 'jsonwebtoken';

function assertDefined(value: string | null | undefined, message: string) {
  if (value === undefined || value === null || value === '') {
    throw new Error(message);
  }
}
export type AuthHeaderConfig = {
  privateKey: string;
  keyId: string;
  issuer: string;
  audience: string;
  tokenExpiryMs?: number;
  tokenMaxAgeMs?: number;
  subject?: string;
  additionalClaims?: any;
};
export function createAuthHeaderGenerator(jwtConfig: AuthHeaderConfig) {
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
  const globalClaims = jwtConfig?.additionalClaims ?? {};

  function getOrGenerateAuthHeader(additionalClaims: any = {}) {
    const now = Date.now();

    const claims = {
      ...generateStandardClaims(now),
      ...globalClaims,
      ...additionalClaims,
    };

    if (!isExpired(now)) {
      return authHeader;
    }

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

  return getOrGenerateAuthHeader;
}

export default createAuthHeaderGenerator;
