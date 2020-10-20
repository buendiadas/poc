import { printReceived, matcherHint } from 'jest-matcher-utils';

export function toBeProperPrivateKey(received: string) {
  const pass = new RegExp('^0x[0-9-a-fA-F]{64}$').test(received);
  const message = pass
    ? () =>
        matcherHint('.not.toBeProperPrivateKey') +
        '\n\n' +
        `Expected value to not be a proper private key\n` +
        `Received:\n` +
        `  ${printReceived(received)}`
    : () =>
        matcherHint('.toBeProperPrivateKey') +
        '\n\n' +
        `Expected value to be a proper private key\n` +
        `Received:\n` +
        `  ${printReceived(received)}`;

  return { pass, message };
}
