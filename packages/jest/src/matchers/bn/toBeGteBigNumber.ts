import { BigNumberish } from 'ethers';
import { matcherHint, printExpected, printReceived } from 'jest-matcher-utils';
import { printBigNumber, ensureBigNumbers } from './utils';

export function toBeGteBigNumber(
  this: jest.MatcherContext,
  received: BigNumberish,
  expected: BigNumberish,
) {
  return ensureBigNumbers(received, expected, this.isNot, function (
    received,
    expected,
  ) {
    const receivedStr = printReceived(printBigNumber(received));
    const expectedStr = printExpected(printBigNumber(expected));

    const pass = received.gte(expected);
    const message = pass
      ? () =>
          matcherHint('.not.toBeGteBigNumber') +
          '\n\n' +
          `Expected value to not be greater than or equal:\n` +
          `  ${expectedStr}\n` +
          `Received:\n` +
          `  ${receivedStr}`
      : () =>
          matcherHint('.toBeGteBigNumber') +
          '\n\n' +
          `Expected value to be greater than or equal:\n` +
          `  ${expectedStr}\n` +
          `Received:\n` +
          `  ${receivedStr}`;

    return { pass, message };
  });
}
