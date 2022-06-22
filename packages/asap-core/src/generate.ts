import crypto from 'crypto';
import { readFileSync } from 'fs';
import jsonWebToken, { SignOptions } from 'jsonwebtoken';
import path from 'path';

const testPrivateKey = readFileSync(
  path.join(__dirname, '../keys_for_test/private_key_for_tests.pem')
).toString('utf-8');

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
  /**
   * Insecure mode forces the generator to use a static private key for encryption
   * This mode helps services to test authentication flows
   * @default false
   */
  insecureMode?: boolean;
};
export function createAuthHeaderGenerator(jwtConfig: AuthHeaderConfig) {
  if (jwtConfig.insecureMode) jwtConfig.privateKey = testPrivateKey; // eslint-disable-line no-param-reassign
  assertDefined(jwtConfig.privateKey, 'jwtConfig.privateKey must be set');
  assertDefined(jwtConfig.keyId, 'jwtConfig.keyId must be set');
  assertDefined(jwtConfig.issuer, 'jwtConfig.issuer must be set');
  assertDefined(jwtConfig.audience, 'jwtConfig.audience must be set');

  const privateKey = jwtConfig.privateKey
    .replace(/\\n/g, '\n')
    .replace(/"/g, '');

  // The max age is less than the expiry so that we don't ever reuse a nearly expired token
  const tokenExpiryMs = jwtConfig.tokenExpiryMs || 10 * 60 * 1000;

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

    const options: SignOptions = {
      algorithm: 'RS256',
      header: {
        alg: 'RS256',
        kid: jwtConfig.keyId,
      },
    };

    const authHeader = `Bearer ${jsonWebToken.sign(
      claims,
      privateKey,
      options
    )}`;
    return authHeader;
  }

  return getOrGenerateAuthHeader;
}

export default createAuthHeaderGenerator;
