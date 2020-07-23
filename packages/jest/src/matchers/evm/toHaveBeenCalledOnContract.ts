import { Contract, ContractFunction } from '@crestproject/ethers';
import { ensureParameters } from './utils';

export function toHaveBeenCalledOnContract(
  this: jest.MatcherContext,
  fn: ContractFunction,
): jest.CustomMatcherResult;
export function toHaveBeenCalledOnContract(
  this: jest.MatcherContext,
  contract: Contract,
): jest.CustomMatcherResult;
export function toHaveBeenCalledOnContract(
  this: jest.MatcherContext,
  subject: Contract | ContractFunction,
): jest.CustomMatcherResult {
  return ensureParameters(this, subject, (history, contract, fragment) => {
    const signature = fragment ? contract.abi.getSighash(fragment) : '0x';
    const calls = history
      .calls(contract)
      .filter((call) => call.startsWith(signature));

    const method = fragment?.format();
    const expected = `${method ? `function "${method}"` : 'contract'}`;

    const pass = calls.length !== 0;
    const message = pass
      ? () =>
          this.utils.matcherHint('.not.toHaveBeenCalledOnContract') +
          '\n\n' +
          `Expected:\n` +
          `  ${this.utils.printExpected(
            `${expected} not to have been called`,
          )}\n` +
          `Actual:\n` +
          `  ${this.utils.printReceived(
            `${expected} was called ${calls.length} times`,
          )}`
      : () =>
          this.utils.matcherHint('.toHaveBeenCalledOnContract') +
          '\n\n' +
          `Expected:\n` +
          `  ${this.utils.printExpected(`${expected} to have been called`)}\n` +
          `Actual:\n` +
          `  ${this.utils.printReceived(`${expected} was never called`)}`;

    return { pass, message };
  });
}
