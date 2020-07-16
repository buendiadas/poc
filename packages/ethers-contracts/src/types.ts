import { ethers } from 'ethers';
import { Contract } from './contract';
import {
  CallFunction,
  ConstructorFunction,
  FunctionOptions,
  SendFunction,
} from './function';

export interface FunctionDefinition {
  type: 'call' | 'send' | 'construct';
  signature: (...args: any) => any;
  input: any[];
  output: any;
}

export type Deploy<TSignature extends (...args: any) => any = any> = {
  type: 'construct';
  signature: TSignature;
  input: Parameters<TSignature>;
  output: ReturnType<TSignature>;
};

export type Call<TSignature extends (...args: any) => any = any> = {
  type: 'call';
  signature: TSignature;
  input: Parameters<TSignature>;
  output: ReturnType<TSignature>;
};

export type Send<
  TSignature extends (...args: any) => any = any,
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
  : TFunction extends Deploy
  ? ConstructorFunction<TFunction['input']>
  : never;

export type ShortcutFunctionOutput<
  TFunction extends FunctionDefinition,
  TParent extends Contract = Contract
> = TFunction extends Call
  ? Promise<TFunction['output']>
  : TFunction extends Send
  ? Promise<ethers.ContractReceipt>
  : TFunction extends Deploy
  ? Promise<TParent>
  : never;

export type ProxiedFunction<
  TFunction extends FunctionDefinition,
  TParent extends Contract = Contract
> = {
  contract: TParent;
  (...args: TFunction['input']): ShortcutFunctionOutput<TFunction, TParent>;
  (options: FunctionOptions<TFunction['input']>): FullFunction<
    TFunction,
    TParent
  >;
} & FullFunction<TFunction>;

export type ConcreteContract<TFunctions extends Functions> = Contract &
  {
    [TKey in keyof TFunctions]: TKey extends keyof Contract
      ? Contract[TKey]
      : ProxiedFunction<TFunctions[TKey], ConcreteContract<TFunctions>>;
  };
