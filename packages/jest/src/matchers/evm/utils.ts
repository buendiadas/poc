import { utils } from 'ethers';
import { Contract, ContractFunction } from '@crestproject/ethers';
import { BuidlerProvider, History } from '@crestproject/evm';
import { forceFail } from '../utils';

export type MatcherCallback<
  TReturn extends jest.CustomMatcherResult | Promise<jest.CustomMatcherResult>
> = (
  history: History,
  contract: Contract,
  fragment?: utils.FunctionFragment
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
  const fn = ContractFunction.isContractFunction(subject)
    ? subject
    : typeof subject === 'function' &&
      ContractFunction.isContractFunction((subject as ContractFunction)?.ref)
    ? (subject as ContractFunction).ref
    : undefined;

  const contract = ContractFunction.isContractFunction(fn)
    ? fn.contract
    : Contract.isContract(subject)
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

  const fragment = ContractFunction.isContractFunction(fn)
    ? fn.fragment
    : undefined;
  return callback(history, contract, fragment);
}
