import { Contract, ContractFunction } from '@crestproject/ethers';
import { BuidlerProvider, History } from '@crestproject/evm';
import { ethers } from 'ethers';

export type MatcherCallback = (
  history: History,
  contract: Contract,
  fragment?: ethers.utils.FunctionFragment,
) => jest.CustomMatcherResult;

export function ensureParameters<
  TSubject extends Contract | ContractFunction<any> = any
>(context: jest.MatcherContext, subject: TSubject, callback: MatcherCallback) {
  const fn =
    subject instanceof ContractFunction
      ? subject
      : typeof subject === 'function' &&
        (subject as ContractFunction).ref instanceof ContractFunction
      ? (subject as ContractFunction).ref
      : undefined;

  const contract =
    fn instanceof ContractFunction
      ? fn.contract
      : subject instanceof Contract
      ? subject
      : undefined;

  if (!contract) {
    const error =
      'Missing contract instance for contract call history assertion';
    return forceFail(context, subject, error);
  }

  const history = (contract?.provider as BuidlerProvider)?.history;
  if (!history) {
    const error =
      'Invalid or unsupported provider for contract call history assertion';
    return forceFail(context, subject, error);
  }

  const fragment = fn instanceof ContractFunction ? fn.fragment : undefined;
  return callback(history, contract, fragment);
}

export function forceFail(
  context: jest.MatcherContext,
  value: any,
  error: string,
) {
  const pass = context.isNot ? true : false;
  const message = () =>
    `${error}:\n\n` + `  ${context.utils.printReceived(value)}`;

  return { pass, message };
}
