import { BigNumber, BigNumberish } from 'ethers';
import { printBigNumber, ensureBigNumbers } from './utils';

export function toBeGteBigNumber(
  this: jest.MatcherContext,
  received: BigNumberish,
  expected: BigNumberish
) {
  return ensureBigNumbers(this, received, expected, (received, expected) => {
    const receivedBn = BigNumber.from(received);
    const expectedBn = BigNumber.from(expected);
    const receivedStr = this.utils.printReceived(printBigNumber(receivedBn));
    const expectedStr = this.utils.printExpected(printBigNumber(expectedBn));

    const pass = receivedBn.gte(expectedBn);
    const message = pass
      ? () =>
          this.utils.matcherHint('.not.toBeGteBigNumber') +
          '\n\n' +
          `Expected value to not be greater than or equal:\n` +
          `  ${expectedStr}\n` +
          `Received:\n` +
          `  ${receivedStr}`
      : () =>
          this.utils.matcherHint('.toBeGteBigNumber') +
          '\n\n' +
          `Expected value to be greater than or equal:\n` +
          `  ${expectedStr}\n` +
          `Received:\n` +
          `  ${receivedStr}`;

    return { pass, message };
  });
}
