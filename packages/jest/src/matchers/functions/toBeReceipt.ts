import { printReceived, matcherHint } from 'jest-matcher-utils';
import { isTransactionReceipt } from '../../utils';

export function toBeReceipt(this: jest.MatcherContext, received: any) {
  const pass = isTransactionReceipt(received);
  const message = pass
    ? () =>
        matcherHint('.not.toBeReceipt') +
        '\n\n' +
        `Expected value not to be a transaction receipt\n` +
        `Received:\n` +
        `  ${printReceived(received)}`
    : () =>
        matcherHint('.toBeReceipt') +
        '\n\n' +
        `Expected value to be a transaction receipt\n` +
        `Received:\n` +
        `  ${printReceived(received)}`;

  return { pass, message };
}
