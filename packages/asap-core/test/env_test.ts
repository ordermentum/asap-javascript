import { describe, afterEach, beforeEach } from 'mocha';
import { expect } from 'chai';
import sinon from 'sinon';
import { getKey, createPublicKeyFetcher } from '../src/fetchers/env';

describe('env', () => {
  let jwtConfig;
  let currentTime;
  let time;

  beforeEach(() => {
    time = sinon.useFakeTimers(123456789 * 1000);
  });

  afterEach(() => {
    time.restore();
  });

  describe('getKey', () => {
    it('correclty formats env key', async () => {
      const key = getKey('APP_', 'test/key');
      expect(key).to.equal('APP_TEST_KEY');
    });
  });

  describe('environmentFetcher', () => {
    it('correclty env value', async () => {
      process.env.APP_TEST_KEY = '123';
      const fetcher = createPublicKeyFetcher('APP_');
      const key = await fetcher('test/key');
      expect(key).to.equal('123');
    });
  });
});
