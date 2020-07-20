import { ethers } from 'ethers';
import { ensureBigNumbers, printBigNumber } from './utils';

export function toBeLtBigNumber(
  this: jest.MatcherContext,
  received: ethers.BigNumberish,
  expected: ethers.BigNumberish,
) {
  return ensureBigNumbers(this, received, expected, (received, expected) => {
    const receivedStr = this.utils.printReceived(printBigNumber(received));
    const expectedStr = this.utils.printExpected(printBigNumber(expected));

    const pass = received.lt(expected);
    const message = pass
      ? () =>
          this.utils.matcherHint('.not.toBeLtBigNumber') +
          '\n\n' +
          `Expected value to not be lower than:\n` +
          `  ${expectedStr}\n` +
          `Received:\n` +
          `  ${receivedStr}`
      : () =>
          this.utils.matcherHint('.toBeLtBigNumber') +
          '\n\n' +
          `Expected value to be lower than:\n` +
          `  ${expectedStr}\n` +
          `Received:\n` +
          `  ${receivedStr}`;

    return { pass, message };
  });
}