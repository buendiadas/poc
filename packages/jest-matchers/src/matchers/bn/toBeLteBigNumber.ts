import { ethers } from 'ethers';
import { printBigNumber } from './utils';

export function toBeLteBigNumber(
  this: jest.MatcherContext,
  received: ethers.BigNumberish,
  expected: ethers.BigNumberish,
) {
  const receivedBn = ethers.BigNumber.from(received);
  const expectedBn = ethers.BigNumber.from(expected);
  const receivedStr = this.utils.printReceived(printBigNumber(receivedBn));
  const expectedStr = this.utils.printExpected(printBigNumber(expectedBn));

  const pass = receivedBn.lte(expectedBn);
  const message = pass
    ? () =>
        this.utils.matcherHint('.not.toBeLteBigNumber') +
        '\n\n' +
        `Expected value to not be lower than or equal:\n` +
        `  ${expectedStr}\n` +
        `Received:\n` +
        `  ${receivedStr}`
    : () =>
        this.utils.matcherHint('.toBeLteBigNumber') +
        '\n\n' +
        `Expected value to be lower than or equal:\n` +
        `  ${expectedStr}\n` +
        `Received:\n` +
        `  ${receivedStr}`;

  return { pass, message };
}
