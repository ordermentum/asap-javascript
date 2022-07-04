import { describe, afterEach, beforeEach } from 'mocha';
import { expect } from 'chai';
import sinon from 'sinon';
import { createPublicKeyFetcher, createTestPublicKeyFetcher } from '../src/fetchers/file';

describe('file', () => {
  let time;

  beforeEach(() => {
    time = sinon.useFakeTimers(123456789 * 1000);
  });

  afterEach(() => {
    time.restore();
  });

  describe('fileLoader', () => {
    it('correctly loads file value', async () => {
      const fetcher = createPublicKeyFetcher(`${__dirname}/data/`);
      const key = await fetcher('test/private');
      expect(key).to.exist;
    });

    it('throws error', async () => {
      const fetcher = createPublicKeyFetcher(`${__dirname}/data/`);
      let e;
      try {
        const key = await fetcher('test/missing');
      } catch (err) {
        e = err;
      }
      expect(e).to.exist;
    });

    context('Insecure key loader', () => {
      it('Loads the same static public key', async () => {
        const fetcher = createTestPublicKeyFetcher();
        const key1 = await fetcher('test/service_1');
        const key2 = await fetcher('test/service_2');
        expect(key1).to.eqls(key2);
      });
    })
  });
});
