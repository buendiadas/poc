import { BigNumberish } from 'ethers';
import { ensureBigNumbers, printBigNumber } from './utils';

export function toBeLteBigNumber(
  this: jest.MatcherContext,
  received: BigNumberish,
  expected: BigNumberish
) {
  return ensureBigNumbers(this, received, expected, (received, expected) => {
    const receivedStr = this.utils.printReceived(printBigNumber(received));
    const expectedStr = this.utils.printExpected(printBigNumber(expected));

    const pass = received.lte(expected);
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
  });
}
