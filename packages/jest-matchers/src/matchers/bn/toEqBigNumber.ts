import { ethers } from 'ethers';
import { ensureBigNumbers, printBigNumber } from './utils';

export function toEqBigNumber(
  this: jest.MatcherContext,
  received: ethers.BigNumberish,
  expected: ethers.BigNumberish,
) {
  return ensureBigNumbers(this, received, expected, (received, expected) => {
    const receivedStr = this.utils.printReceived(printBigNumber(received));
    const expectedStr = this.utils.printExpected(printBigNumber(expected));

    const pass = received.eq(expected);
    const message = pass
      ? () =>
          this.utils.matcherHint('.not.toEqBigNumber') +
          '\n\n' +
          `Expected:\n` +
          `  ${expectedStr}\n` +
          `Received:\n` +
          `  ${receivedStr}`
      : () =>
          this.utils.matcherHint('.toEqBigNumber') +
          '\n\n' +
          `Expected:\n` +
          `  ${expectedStr}\n` +
          `Received:\n` +
          `  ${receivedStr}`;

    return { pass, message };
  });
}
