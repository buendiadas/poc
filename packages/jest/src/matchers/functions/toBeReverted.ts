export function toBeReverted(this: jest.MatcherContext, received: Error) {
  const error = received?.message || JSON.stringify(received);
  const isReverted = error.search('revert') >= 0;
  const isThrown = error.search('invalid opcode') >= 0;
  const isError = error.search('code=') >= 0;

  const pass = isReverted || isThrown || isError;
  const message = pass
    ? () =>
        this.utils.matcherHint('.not.toBeReverted') +
        '\n\n' +
        `Expected transaction not to be reverted\n` +
        `Received:\n` +
        `  ${this.utils.printReceived(received.message)}`
    : () =>
        this.utils.matcherHint('.toBeReverted') +
        '\n\n' +
        `Expected transaction to be reverted\n` +
        `Received:\n` +
        `  ${this.utils.printReceived(received.message)}`;

  return { pass, message };
}
