import { ethers } from 'ethers';
import { Contract } from './contract';
import { CallFunction, FunctionOptions, SendFunction } from './function';

export type AnyFunction = (...args: any) => any;

export interface FunctionDefinition {
  type: 'call' | 'send';
  signature: (...args: any) => any;
  input: any[];
  output: any;
}

export type Call<TSignature extends AnyFunction = any> = {
  type: 'call';
  signature: TSignature;
  input: Parameters<TSignature>;
  output: ReturnType<TSignature>;
};

export type Send<
  TSignature extends AnyFunction = any,
  TPayable extends boolean = false
> = {
  type: 'send';
  payable: TPayable;
  signature: TSignature;
  input: Parameters<TSignature>;
  output: ReturnType<TSignature>;
};

export interface Functions {
  [signature: string]: FunctionDefinition;
}

export type FullFunction<
  TFunction extends FunctionDefinition,
  TParent extends Contract = Contract
> = TFunction extends Call
  ? CallFunction<TFunction['input'], TFunction['output'], TParent>
  : TFunction extends Send
  ? SendFunction<TFunction['input'], TFunction['output'], TParent>
  : never;

export type ShortcutFunctionOutput<
  TFunction extends FunctionDefinition
> = TFunction extends Call
  ? Promise<TFunction['output']>
  : TFunction extends Send
  ? Promise<ethers.ContractReceipt>
  : never;

export type ProxiedFunction<
  TFunction extends FunctionDefinition,
  TParent extends Contract = Contract
> = {
  contract: TParent;
  (...args: TFunction['input']): ShortcutFunctionOutput<TFunction>;
  (options: FunctionOptions<TFunction['input']>): ShortcutFunctionOutput<
    TFunction
  >;
} & FullFunction<TFunction>;

export type ConcreteContract<TFunctions extends Functions> = Contract &
  {
    [TKey in keyof TFunctions]: TKey extends keyof Contract
      ? Contract[TKey]
      : ProxiedFunction<TFunctions[TKey], ConcreteContract<TFunctions>>;
  };
