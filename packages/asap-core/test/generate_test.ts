import { describe, afterEach, beforeEach } from 'mocha';
import { expect } from 'chai';
import sinon from 'sinon';
import createAuthHeaderGenerator from '../src/generate';

import { parseAuthHeader, privateKeyPem } from './test_helper';

describe('createAuthHeaderGenerator', () => {
  let jwtConfig;
  let currentTime;
  let time;

  beforeEach(() => {
    time = sinon.useFakeTimers(123456789 * 1000);
    jwtConfig = {
      privateKey: privateKeyPem,
      issuer: 'an-issuer',
      keyId: 'the-keyid',
      audience: 'an-audience',
    };
  });

  afterEach(() => {
    time.restore();
  });

  function generateToken(generator = createAuthHeaderGenerator(jwtConfig)) {
    const authHeader = generator();
    const token = parseAuthHeader(authHeader);
    return token;
  }

  describe('generation', () => {
    it('has iss claim', () => {
      const token = generateToken();

      expect(token.iss).to.eql('an-issuer');
    });

    it('has sub claim set to issuer if not provided', () => {
      const token = generateToken();

      expect(token.sub).to.eql('an-issuer');
    });

    it('has sub claim set to provided value', () => {
      jwtConfig.subject = 'a-subject';

      const token = generateToken();

      expect(token.sub).to.eql('a-subject');
    });

    it('has aud claim', () => {
      const token = generateToken();

      expect(token.aud).to.eql('an-audience');
    });

    it('has jti claim', () => {
      const token = generateToken();

      expect(token.jti).to.not.be.undefined;
    });

    it('has iat claim set to the current time', () => {
      const token = generateToken();

      expect(token.iat).to.eql(123456789);
    });

    it('has nbf claim set to the current time', () => {
      const token = generateToken();

      expect(token.nbf).to.eql(123456789);
    });

    it('has exp claim set to 10 minutes after the current time', () => {
      const token = generateToken();

      expect(token.exp).to.eql(123456789 + 600);
    });

    it('has exp claim set to custom expiry time', () => {
      jwtConfig.tokenExpiryMs = 42000;

      const token = generateToken();

      expect(token.exp).to.eql(123456789 + 42);
    });

    it('removes newlines and quotes from the private key', () => {
      jwtConfig.privateKey = `"\\n${jwtConfig.privateKey}\\n"`;

      const token = generateToken();

      expect(token).to.not.be.undefined;
    });

    it('generates the same token if called twice within 9 minutes', () => {
      const generator = createAuthHeaderGenerator(jwtConfig);

      const firstToken = generateToken(generator);
      currentTime += 9 * 60 * 1000;
      const secondToken = generateToken(generator);

      expect(firstToken).to.deep.equal(secondToken);
    });

    it('generates unique tokens if called after 9 minutes', () => {
      const generator = createAuthHeaderGenerator(jwtConfig);

      const firstToken = generateToken(generator);
      currentTime += 9 * 60 * 1000 + 1;
      const secondToken = generateToken(generator);

      expect(firstToken).not.to.equal(secondToken);
    });

    it('generates the same token if called twice within custom age', () => {
      jwtConfig.tokenMaxAgeMs = 10 * 60 * 1000 - 1;
      const generator = createAuthHeaderGenerator(jwtConfig);

      const firstToken = generateToken(generator);
      currentTime += 10 * 60 * 1000 - 1;
      const secondToken = generateToken(generator);

      expect(firstToken).to.deep.equal(secondToken);
    });

    it('fails if missing keyId', () => {
      delete jwtConfig.keyId;

      expect(() => createAuthHeaderGenerator(jwtConfig)).to.throw(
        /jwtConfig.keyId must be set/
      );
    });

    it('fails if missing issuer', () => {
      delete jwtConfig.issuer;

      expect(() => createAuthHeaderGenerator(jwtConfig)).to.throw(
        /jwtConfig.issuer must be set/
      );
    });

    it('fails if missing privateKey', () => {
      delete jwtConfig.privateKey;

      expect(() => createAuthHeaderGenerator(jwtConfig)).to.throw(
        /jwtConfig.privateKey must be set/
      );
    });

    it('fails if invalid privateKey', () => {
      jwtConfig.privateKey = 'this is not a valid key';

      expect(() => createAuthHeaderGenerator(jwtConfig)).to.throw(
        /PEM.*no start line/
      );
    });

    it('fails if missing audience', () => {
      delete jwtConfig.audience;

      expect(() => createAuthHeaderGenerator(jwtConfig)).to.throw(
        /audience must be set/
      );
    });

    it('supports additional claims', () => {
      jwtConfig.additionalClaims = {
        myCustomClaim: 'foo bar',
      };

      const token = generateToken();

      expect(token.myCustomClaim).to.eql('foo bar');
    });
  });
});
