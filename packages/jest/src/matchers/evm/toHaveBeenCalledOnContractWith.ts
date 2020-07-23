import { ethers } from 'ethers';
import { ContractFunction } from '@crestproject/ethers';
import { ensureParameters, forceFail } from './utils';

export function toHaveBeenCalledOnContractWith<TArgs extends any[] = []>(
  this: jest.MatcherContext,
  subject: ContractFunction<TArgs>,
  ...args: TArgs
): jest.CustomMatcherResult {
  return ensureParameters(this, subject, (history, contract, fragment) => {
    if (!ethers.utils.FunctionFragment.isFunctionFragment(fragment)) {
      const error =
        'Missing or invalid function fragment for call history assertion';
      return forceFail(this, subject, error);
    }

    const signature = contract.abi.encodeFunctionData(fragment, args);
    const calls = history
      .calls(contract)
      .filter((call) => call.startsWith(signature));

    // TODO: Print serialized list of arguments
    const expected = `function "${fragment.format()}"`;
    const pass = calls.length !== 0;
    const message = pass
      ? () =>
          this.utils.matcherHint('.not.toHaveBeenCalledOnContractWith') +
          '\n\n' +
          `Expected:\n` +
          `  ${this.utils.printExpected(
            `${expected} not to have been called with specified arguments`,
          )}\n` +
          `Actual:\n` +
          `  ${this.utils.printReceived(
            `${expected} was called ${calls.length} times with these arguments`,
          )}`
      : () =>
          this.utils.matcherHint('.toHaveBeenCalledOnContractWith') +
          '\n\n' +
          `Expected:\n` +
          `  ${this.utils.printExpected(
            `${expected} to have been called with specified arguments`,
          )}\n` +
          `Actual:\n` +
          `  ${this.utils.printReceived(
            `${expected} was never called with these arguments`,
          )}`;

    return { pass, message };
  });
}
