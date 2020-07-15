import { ethers } from 'ethers';
import { printBigNumber } from './utils';

export function toEqBigNumber(
  this: jest.MatcherContext,
  received: ethers.BigNumberish,
  expected: ethers.BigNumberish,
) {
  const receivedBn = ethers.BigNumber.from(received);
  const expectedBn = ethers.BigNumber.from(expected);
  const receivedStr = this.utils.printReceived(printBigNumber(receivedBn));
  const expectedStr = this.utils.printExpected(printBigNumber(expectedBn));

  const pass = receivedBn.eq(expectedBn);
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
}
