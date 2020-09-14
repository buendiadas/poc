import { Contract, ContractFunction } from '@crestproject/ethers';
import { BuidlerProvider, History } from '@crestproject/evm';
import { ethers } from 'ethers';
import { forceFail } from '../utils';

export type MatcherCallback<
  TReturn extends jest.CustomMatcherResult | Promise<jest.CustomMatcherResult>
> = (
  history: History,
  contract: Contract,
  fragment?: ethers.utils.FunctionFragment
) => TReturn;

export function ensureParameters<
  TSubject extends Contract | ContractFunction<any> = any,
  TReturn extends
    | jest.CustomMatcherResult
    | Promise<jest.CustomMatcherResult> = jest.CustomMatcherResult
>(
  context: jest.MatcherContext,
  subject: TSubject,
  callback: MatcherCallback<TReturn>
): TReturn {
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
    return forceFail(context, subject, error) as TReturn;
  }

  const history = (contract?.provider as BuidlerProvider)?.history;
  if (!history) {
    const error =
      'Invalid or unsupported provider for contract call history assertion';
    return forceFail(context, subject, error) as TReturn;
  }

  const fragment = fn instanceof ContractFunction ? fn.fragment : undefined;
  return callback(history, contract, fragment);
}
