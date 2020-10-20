import { Contract, ContractFunction } from '@crestproject/ethers';
import { printReceived, printExpected, matcherHint } from 'jest-matcher-utils';
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
  const invert = this.isNot;

  return ensureParameters(subject, invert, function (
    history,
    contract,
    fragment
  ) {
    const signature = fragment ? contract.abi.getSighash(fragment) : '0x';
    const method = fragment?.format();
    const expected = `${method ? `function "${method}"` : 'contract'}`;
    const pass = history
      .calls(contract)
      .some((call) => call.startsWith(signature));

    const message = pass
      ? () =>
          matcherHint('.not.toHaveBeenCalledOnContract') +
          '\n\n' +
          `Expected:\n` +
          `  ${printExpected(`${expected} not to have been called`)}\n` +
          `Actual:\n` +
          `  ${printReceived(`${expected} has been called`)}`
      : () =>
          matcherHint('.toHaveBeenCalledOnContract') +
          '\n\n' +
          `Expected:\n` +
          `  ${printExpected(`${expected} to have been called`)}\n` +
          `Actual:\n` +
          `  ${printReceived(`${expected} has not been called`)}`;

    return { pass, message };
  });
}
