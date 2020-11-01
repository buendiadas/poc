import { utils } from 'ethers';
import { printReceived, printExpected, matcherHint } from 'jest-matcher-utils';
import {
  Contract,
  ContractFunction,
  resolveArguments,
} from '@crestproject/ethers';
import { ensureParameters } from './utils';
import { forceFail } from '../../utils';

export function toHaveBeenCalledOnContractWith<TArgs extends any[] = []>(
  this: jest.MatcherContext,
  subject: ContractFunction<TArgs>,
  ...args: TArgs
): jest.CustomMatcherResult {
  const invert = this.isNot;

  return ensureParameters(subject, invert, function (
    history,
    contract,
    fragment,
  ) {
    if (!utils.FunctionFragment.isFunctionFragment(fragment)) {
      const error =
        'Missing or invalid function fragment for call history assertion';
      return forceFail(error, invert);
    }

    const resolved = resolveArguments(fragment.inputs, args);
    const signature = contract.abi.encodeFunctionData(fragment, resolved);

    const calls = history.calls(contract);
    const pass = calls.some((call) => call.startsWith(signature));

    const expectedFunction = fragment.format();
    const expectedArgs = fragment.inputs.map(
      (_, index) => `${resolved[index]}`,
    );

    const message = pass
      ? () =>
          matcherHint(
            '.not.toHaveBeenCalledOnContractWith',
            `${expectedFunction}`,
            `\n  ${expectedArgs.join(',\n  ')}\n`,
          ) +
          '\n\n' +
          `Expected: ${printExpected('to not have been called')}\n` +
          `Actual: ${printReceived('has been called')}`
      : () =>
          matcherHint(
            '.toHaveBeenCalledOnContractWith',
            `${expectedFunction}`,
            `\n  ${expectedArgs.join(',\n  ')}\n`,
          ) +
          '\n\n' +
          `Expected: ${printExpected('to have been called')}\n` +
          `Actual: ${printReceived(
            'has not been called with these arguments',
          )}${printHelper(contract, fragment, calls)}`;

    return { pass, message };
  });
}

function printHelper(
  contract: Contract,
  fragment: utils.FunctionFragment,
  calls: string[],
) {
  const signature = contract.abi.getSighash(fragment);
  const latest = calls.reverse().find((call) => call.startsWith(signature));

  if (latest == null) {
    return '';
  }

  const args = contract.abi.decodeFunctionData(fragment, latest);
  const printed = fragment.inputs.map((_, index) => `${args[index]}`);

  return `\n\nLast called with:\n\n${fragment.name}(\n  ${printed.join(
    ',\n  ',
  )} \n)`;
}
