export function toBeRevertedWith(
  this: jest.MatcherContext,
  received: Error,
  match: string | RegExp,
) {
  if (!(received instanceof Error)) {
    throw new Error('Expected error object');
  }

  const isReverted = received.message.search('revert') >= 0;
  const isThrown = received.message.search('invalid opcode') >= 0;
  const isError = received.message.search('code=') >= 0;
  const isMatch = received.message.match(match) != null;

  const pass = (isReverted || isThrown || isError) && isMatch;
  const message = pass
    ? () =>
        this.utils.matcherHint('.not.toBeRevertedWith') +
        '\n\n' +
        `Expected transaction not to be reverted with\n` +
        `  ${this.utils.printExpected(match.toString())}\n` +
        `Received:\n` +
        `  ${this.utils.printReceived(received.message)}`
    : () =>
        this.utils.matcherHint('.toBeRevertedWith') +
        '\n\n' +
        `Expected transaction to be reverted with:\n` +
        `  ${this.utils.printExpected(match.toString())}\n` +
        `Received:\n` +
        `  ${this.utils.printReceived(received.message)}`;

  return { pass, message };
}
