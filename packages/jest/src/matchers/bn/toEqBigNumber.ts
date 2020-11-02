import { BigNumberish } from 'ethers';
import { printReceived, printExpected, matcherHint } from 'jest-matcher-utils';
import { ensureBigNumbers, printBigNumber } from './utils';

export function toEqBigNumber(this: jest.MatcherContext, received: BigNumberish, expected: BigNumberish) {
  return ensureBigNumbers(received, expected, this.isNot, function (received, expected) {
    const receivedStr = printReceived(printBigNumber(received));
    const expectedStr = printExpected(printBigNumber(expected));

    const pass = received.eq(expected);
    const message = pass
      ? () =>
          matcherHint('.not.toEqBigNumber') +
          '\n\n' +
          `Expected:\n` +
          `  ${expectedStr}\n` +
          `Received:\n` +
          `  ${receivedStr}`
      : () =>
          matcherHint('.toEqBigNumber') +
          '\n\n' +
          `Expected:\n` +
          `  ${expectedStr}\n` +
          `Received:\n` +
          `  ${receivedStr}`;

    return { pass, message };
  });
}
