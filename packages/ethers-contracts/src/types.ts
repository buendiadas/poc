import { ethers } from 'ethers';
import { Contract } from './contract';
import {
  CallFunction,
  ConstructorFunction,
  ContractFunction,
  SendFunction,
} from './function';

export type AnyContract = Contract<any>;

export interface Functions {
  [signature: string]: ContractFunction;
}

export type FunctionShortcutReturnType<
  TFunction extends ContractFunction,
  TParent extends AnyContract
> = TFunction extends CallFunction
  ? ReturnType<TFunction['call']>
  : TFunction extends SendFunction
  ? ethers.ContractReceipt
  : TFunction extends ConstructorFunction
  ? Promise<TParent>
  : never;

export type FunctionArgs<TFunction extends ContractFunction> = Required<
  TFunction['options']
>['args'] extends any[]
  ? Required<TFunction['options']>['args']
  : never;

export type FunctionWithShortcut<
  TFunction extends ContractFunction,
  TParent extends AnyContract
> = TFunction & {
  contract: TParent;

  // TODO: Do not add the args overload if there are no args.
  (options: TFunction['options']): FunctionShortcutReturnType<
    TFunction,
    TParent
  >;

  (...args: FunctionArgs<TFunction>): FunctionShortcutReturnType<
    TFunction,
    TParent
  >;
};

export type ProxyContract<TFunctions extends Functions> = Contract<TFunctions> &
  {
    [TKey in keyof TFunctions]: FunctionWithShortcut<
      TFunctions[TKey],
      ProxyContract<TFunctions>
    >;
  };
