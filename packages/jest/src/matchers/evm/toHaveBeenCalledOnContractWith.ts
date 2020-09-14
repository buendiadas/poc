import { ethers } from 'ethers';
import { ContractFunction, resolveArguments } from '@crestproject/ethers';
import { ensureParameters } from './utils';
import { forceFail } from '../utils';

export function toHaveBeenCalledOnContractWith<TArgs extends any[] = []>(
  this: jest.MatcherContext,
  subject: ContractFunction<TArgs>,
  ...args: TArgs
): Promise<jest.CustomMatcherResult> {
  return ensureParameters(
    this,
    subject,
    async (history, contract, fragment) => {
      if (!ethers.utils.FunctionFragment.isFunctionFragment(fragment)) {
        const error =
          'Missing or invalid function fragment for call history assertion';
        return forceFail(this, subject, error);
      }

      const resolved = await resolveArguments(fragment.inputs, args);
      const signature = contract.abi.encodeFunctionData(fragment, resolved);
      const expected = `function "${fragment.format()}"`;
      const pass = history
        .calls(contract)
        .some((call) => call.startsWith(signature));

      // TODO: Print serialized list of arguments
      const message = pass
        ? () =>
            this.utils.matcherHint('.not.toHaveBeenCalledOnContractWith') +
            '\n\n' +
            `Expected:\n` +
            `  ${this.utils.printExpected(
              `${expected} not to have been called with specified arguments`
            )}\n` +
            `Actual:\n` +
            `  ${this.utils.printReceived(
              `${expected} has neen called with these arguments`
            )}`
        : () =>
            this.utils.matcherHint('.toHaveBeenCalledOnContractWith') +
            '\n\n' +
            `Expected:\n` +
            `  ${this.utils.printExpected(
              `${expected} to have been called with specified arguments`
            )}\n` +
            `Actual:\n` +
            `  ${this.utils.printReceived(
              `${expected} has not been called with these arguments`
            )}`;

      return { pass, message };
    }
  );
}
