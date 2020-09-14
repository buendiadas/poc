import { ethers } from 'ethers';
import { ensureBigNumbers, printBigNumber } from './utils';

export function toBeGtBigNumber(
  this: jest.MatcherContext,
  received: ethers.BigNumberish,
  expected: ethers.BigNumberish
) {
  return ensureBigNumbers(this, received, expected, (received, expected) => {
    const receivedStr = this.utils.printReceived(printBigNumber(received));
    const expectedStr = this.utils.printExpected(printBigNumber(expected));

    const pass = received.gt(expected);
    const message = pass
      ? () =>
          this.utils.matcherHint('.not.toBeGtBigNumber') +
          '\n\n' +
          `Expected value to not be greater than:\n` +
          `  ${expectedStr}\n` +
          `Received:\n` +
          `  ${receivedStr}`
      : () =>
          this.utils.matcherHint('.toBeGtBigNumber') +
          '\n\n' +
          `Expected value to be greater than:\n` +
          `  ${expectedStr}\n` +
          `Received:\n` +
          `  ${receivedStr}`;

    return { pass, message };
  });
}
