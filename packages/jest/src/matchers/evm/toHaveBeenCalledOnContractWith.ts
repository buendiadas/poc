import { utils } from 'ethers';
import { printReceived, printExpected, matcherHint } from 'jest-matcher-utils';
import { ContractFunction, resolveArguments } from '@crestproject/ethers';
import { ensureParameters } from './utils';
import { forceFail } from '../../utils';

export function toHaveBeenCalledOnContractWith<TArgs extends any[] = []>(
  this: jest.MatcherContext,
  subject: ContractFunction<TArgs>,
  ...args: TArgs
): Promise<jest.CustomMatcherResult> {
  const invert = this.isNot;

  return ensureParameters(subject, invert, async function (
    history,
    contract,
    fragment
  ) {
    if (!utils.FunctionFragment.isFunctionFragment(fragment)) {
      const error =
        'Missing or invalid function fragment for call history assertion';
      return forceFail(subject, error, invert);
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
          matcherHint('.not.toHaveBeenCalledOnContractWith') +
          '\n\n' +
          `Expected:\n` +
          `  ${printExpected(
            `${expected} not to have been called with specified arguments`
          )}\n` +
          `Actual:\n` +
          `  ${printReceived(
            `${expected} has neen called with these arguments`
          )}`
      : () =>
          matcherHint('.toHaveBeenCalledOnContractWith') +
          '\n\n' +
          `Expected:\n` +
          `  ${printExpected(
            `${expected} to have been called with specified arguments`
          )}\n` +
          `Actual:\n` +
          `  ${printReceived(
            `${expected} has not been called with these arguments`
          )}`;

    return { pass, message };
  });
}
