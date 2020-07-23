import { Contract, ContractFunction } from '@crestproject/ethers';
import { ensureParameters } from './utils';

export function toHaveBeenCalledOnContractTimes(
  this: jest.MatcherContext,
  fn: ContractFunction,
  count: number,
): jest.CustomMatcherResult;
export function toHaveBeenCalledOnContractTimes(
  this: jest.MatcherContext,
  contract: Contract,
  count: number,
): jest.CustomMatcherResult;
export function toHaveBeenCalledOnContractTimes(
  this: jest.MatcherContext,
  subject: Contract | ContractFunction,
  count: number,
): jest.CustomMatcherResult {
  return ensureParameters(this, subject, (history, contract, fragment) => {
    const signature = fragment ? contract.abi.getSighash(fragment) : '0x';
    const calls = history
      .calls(contract)
      .filter((call) => call.startsWith(signature));

    const pass = calls.length === count;
    const method = fragment?.format();
    const expected = `${method ? `function "${method}"` : 'contract'}`;

    const message = pass
      ? () =>
          this.utils.matcherHint('.not.toHaveBeenCalledOnContractTimes') +
          '\n\n' +
          `Expected:\n` +
          `  ${this.utils.printExpected(
            `${expected} not to have been called ${count} times`,
          )}\n` +
          `Actual:\n` +
          `  ${this.utils.printReceived(
            `${expected} was called ${calls.length} times`,
          )}`
      : () =>
          this.utils.matcherHint('.toHaveBeenCalledOnContractTimes') +
          '\n\n' +
          `Expected:\n` +
          `  ${this.utils.printExpected(
            `${expected} to have been called ${count} times`,
          )}\n` +
          `Actual:\n` +
          `  ${this.utils.printReceived(
            `${expected} was called ${calls.length} times`,
          )}`;

    return { pass, message };
  });
}
