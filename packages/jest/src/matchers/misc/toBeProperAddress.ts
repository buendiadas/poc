import { printReceived, matcherHint } from 'jest-matcher-utils';

export function toBeProperAddress(received: string) {
  const pass = new RegExp('^0x[0-9-a-fA-F]{40}$').test(received);
  const message = pass
    ? () =>
        matcherHint('.not.toBeProperAddress') +
        '\n\n' +
        `Expected value to not be a proper address\n` +
        `Received:\n` +
        `  ${printReceived(received)}`
    : () =>
        matcherHint('.toBeProperAddress') +
        '\n\n' +
        `Expected value to be a proper address\n` +
        `Received:\n` +
        `  ${printReceived(received)}`;

  return { pass, message };
}
