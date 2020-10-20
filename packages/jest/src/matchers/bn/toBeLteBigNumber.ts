import { BigNumberish } from 'ethers';
import { printReceived, printExpected, matcherHint } from 'jest-matcher-utils';
import { ensureBigNumbers, printBigNumber } from './utils';

export function toBeLteBigNumber(
  this: jest.MatcherContext,
  received: BigNumberish,
  expected: BigNumberish
) {
  return ensureBigNumbers(received, expected, this.isNot, function (
    received,
    expected
  ) {
    const receivedStr = printReceived(printBigNumber(received));
    const expectedStr = printExpected(printBigNumber(expected));

    const pass = received.lte(expected);
    const message = pass
      ? () =>
          matcherHint('.not.toBeLteBigNumber') +
          '\n\n' +
          `Expected value to not be lower than or equal:\n` +
          `  ${expectedStr}\n` +
          `Received:\n` +
          `  ${receivedStr}`
      : () =>
          matcherHint('.toBeLteBigNumber') +
          '\n\n' +
          `Expected value to be lower than or equal:\n` +
          `  ${expectedStr}\n` +
          `Received:\n` +
          `  ${receivedStr}`;

    return { pass, message };
  });
}
