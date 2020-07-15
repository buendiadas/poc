export function toBeProperHex(
  this: jest.MatcherContext,
  received: string,
  length?: number,
) {
  const repeat = length == null ? '*' : `{${length}}`;
  const pass = new RegExp(`^0x[0-9-a-fA-F]${repeat}$`).test(received);
  const message = pass
    ? () =>
        this.utils.matcherHint('.not.toBeProperHex') +
        '\n\n' +
        `Expected value to not be a proper hex${
          length == null ? '' : `of length ${length}`
        }\n` +
        `Received:\n` +
        `  ${this.utils.printReceived(received)}`
    : () =>
        this.utils.matcherHint('.toBeProperHex') +
        '\n\n' +
        `Expected value to be a proper hex${
          length == null ? '' : `of length ${length}`
        }\n` +
        `Received:\n` +
        `  ${this.utils.printReceived(received)}`;

  return { pass, message };
}
