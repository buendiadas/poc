import { BigNumberish } from 'ethers';
import { printReceived, printExpected, matcherHint } from 'jest-matcher-utils';
import { ensureBigNumbers, printBigNumber } from './utils';

export function toBeLtBigNumber(this: jest.MatcherContext, received: BigNumberish, expected: BigNumberish) {
  return ensureBigNumbers(received, expected, this.isNot, function (received, expected) {
    const receivedStr = printReceived(printBigNumber(received));
    const expectedStr = printExpected(printBigNumber(expected));

    const pass = received.lt(expected);
    const message = pass
      ? () =>
          matcherHint('.not.toBeLtBigNumber') +
          '\n\n' +
          `Expected value to not be lower than:\n` +
          `  ${expectedStr}\n` +
          `Received:\n` +
          `  ${receivedStr}`
      : () =>
          matcherHint('.toBeLtBigNumber') +
          '\n\n' +
          `Expected value to be lower than:\n` +
          `  ${expectedStr}\n` +
          `Received:\n` +
          `  ${receivedStr}`;

    return { pass, message };
  });
}
