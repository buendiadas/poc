export function toBeProperPrivateKey(
  this: jest.MatcherContext,
  received: string,
) {
  const pass = new RegExp('^0x[0-9-a-fA-F]{64}$').test(received);
  const message = pass
    ? () =>
        this.utils.matcherHint('.not.toBeProperPrivateKey') +
        '\n\n' +
        `Expected value to not be a proper private key\n` +
        `Received:\n` +
        `  ${this.utils.printReceived(received)}`
    : () =>
        this.utils.matcherHint('.toBeProperPrivateKey') +
        '\n\n' +
        `Expected value to be a proper private key\n` +
        `Received:\n` +
        `  ${this.utils.printReceived(received)}`;

  return { pass, message };
}
