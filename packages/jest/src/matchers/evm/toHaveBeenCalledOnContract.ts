import { Contract, ContractFunction } from '@crestproject/ethers';
import { ensureParameters } from './utils';

export function toHaveBeenCalledOnContract(
  this: jest.MatcherContext,
  fn: ContractFunction
): jest.CustomMatcherResult;
export function toHaveBeenCalledOnContract(
  this: jest.MatcherContext,
  contract: Contract
): jest.CustomMatcherResult;
export function toHaveBeenCalledOnContract(
  this: jest.MatcherContext,
  subject: Contract | ContractFunction
): jest.CustomMatcherResult {
  return ensureParameters(this, subject, (history, contract, fragment) => {
    const signature = fragment ? contract.abi.getSighash(fragment) : '0x';
    const method = fragment?.format();
    const expected = `${method ? `function "${method}"` : 'contract'}`;
    const pass = history
      .calls(contract)
      .some((call) => call.startsWith(signature));

    const message = pass
      ? () =>
          this.utils.matcherHint('.not.toHaveBeenCalledOnContract') +
          '\n\n' +
          `Expected:\n` +
          `  ${this.utils.printExpected(
            `${expected} not to have been called`
          )}\n` +
          `Actual:\n` +
          `  ${this.utils.printReceived(`${expected} has been called`)}`
      : () =>
          this.utils.matcherHint('.toHaveBeenCalledOnContract') +
          '\n\n' +
          `Expected:\n` +
          `  ${this.utils.printExpected(`${expected} to have been called`)}\n` +
          `Actual:\n` +
          `  ${this.utils.printReceived(`${expected} has not been called`)}`;

    return { pass, message };
  });
}
