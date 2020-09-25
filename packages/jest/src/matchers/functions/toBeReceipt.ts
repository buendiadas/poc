import { ContractReceipt } from 'ethers';

function isReceipt(value: any): value is ContractReceipt {
  if (typeof value === 'object') {
    return (
      value.hasOwnProperty('transactionHash') &&
      value.hasOwnProperty('transactionIndex')
    );
  }

  return false;
}

export function toBeReceipt(this: jest.MatcherContext, received: any) {
  const pass = isReceipt(received);
  const message = pass
    ? () =>
        this.utils.matcherHint('.not.toBeReceipt') +
        '\n\n' +
        `Expected value not to be a transaction receipt\n` +
        `Received:\n` +
        `  ${this.utils.printReceived(received)}`
    : () =>
        this.utils.matcherHint('.toBeReceipt') +
        '\n\n' +
        `Expected value to be a transaction receipt\n` +
        `Received:\n` +
        `  ${this.utils.printReceived(received)}`;

  return { pass, message };
}
