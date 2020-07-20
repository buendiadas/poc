export function toBeProperAddress(this: jest.MatcherContext, received: string) {
  const pass = new RegExp('^0x[0-9-a-fA-F]{40}$').test(received);
  const message = pass
    ? () =>
        this.utils.matcherHint('.not.toBeProperAddress') +
        '\n\n' +
        `Expected value to not be a proper address\n` +
        `Received:\n` +
        `  ${this.utils.printReceived(received)}`
    : () =>
        this.utils.matcherHint('.toBeProperAddress') +
        '\n\n' +
        `Expected value to be a proper address\n` +
        `Received:\n` +
        `  ${this.utils.printReceived(received)}`;

  return { pass, message };
}
