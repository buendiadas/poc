import { ethers } from 'ethers';
import { Contract } from './contract';
import { ContractFunction, SendFunction } from './function';

export type AnyContract = Contract<any>;

export interface Functions {
  [signature: string]: ContractFunction;
}

export type FunctionShortcutReturnType<
  TFunction extends ContractFunction,
  TResponse extends ethers.ContractReceipt | ethers.ContractTransaction
> = TFunction extends SendFunction ? TResponse : ReturnType<TFunction['call']>;

export type FunctionArgs<TFunction extends ContractFunction> = Required<
  TFunction['payload']
>['args'] extends any[]
  ? Required<TFunction['payload']>['args']
  : never;

export type FunctionWithShortcut<
  TFunction extends ContractFunction
> = TFunction & {
  // TODO: Do not add the args overload if there are no args.
  (payload: TFunction['payload']): FunctionShortcutReturnType<
    TFunction,
    ethers.ContractReceipt
  >;

  (...args: FunctionArgs<TFunction>): FunctionShortcutReturnType<
    TFunction,
    ethers.ContractReceipt
  >;
};

export type ProxyContract<TFunctions extends Functions> = Contract<TFunctions> &
  {
    [TKey in keyof TFunctions]: FunctionWithShortcut<TFunctions[TKey]>;
  };
