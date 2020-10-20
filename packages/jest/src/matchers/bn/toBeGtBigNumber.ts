import { BigNumberish } from 'ethers';
import { printReceived, printExpected, matcherHint } from 'jest-matcher-utils';
import { ensureBigNumbers, printBigNumber } from './utils';

export function toBeGtBigNumber(
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

    const pass = received.gt(expected);
    const message = pass
      ? () =>
          matcherHint('.not.toBeGtBigNumber') +
          '\n\n' +
          `Expected value to not be greater than:\n` +
          `  ${expectedStr}\n` +
          `Received:\n` +
          `  ${receivedStr}`
      : () =>
          matcherHint('.toBeGtBigNumber') +
          '\n\n' +
          `Expected value to be greater than:\n` +
          `  ${expectedStr}\n` +
          `Received:\n` +
          `  ${receivedStr}`;

    return { pass, message };
  });
}
