import { describe } from 'mocha';
import { expect } from 'chai';
// import sinon from 'sinon';

import { AsapError } from '../src/errors';

describe('errors', () => {
  describe('AsapError', () => {
    it('can be instantiated with a message argument', () => {
      const error = new AsapError('no keys');
    });
    it('can be instantiated with a message and cause arguments', () => {
      const message = 'too many keys';
      const causeError = new RangeError('expected 1 item, got 59');
      const causeString = 'expected 1 item, got 59';

      const errorWithErrorCause = new AsapError(message, causeError);
      expect(errorWithErrorCause.message).to.equal(message);
      expect(errorWithErrorCause.cause).to.equal(causeError);

      const errorWithStringrCause = new AsapError(message, causeString);
      expect(errorWithStringrCause.message).to.equal(message);
      expect(errorWithStringrCause.cause).to.equal(causeString);
    });
    it('has a logLevel field', () => {
      expect(new AsapError('no keys', '').logLevel).to.be.a('string');
    });
    it('has a statusCode field', () => {
      expect(new AsapError('no keys', '').statusCode).to.be.a('number');
    });
    it(`includes its message in its string represenation`, () => {
      const message = 'there is nothing';
      expect(new AsapError(message, null).toString()).to.include(message);
    });
  });
});
