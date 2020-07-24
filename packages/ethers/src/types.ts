import { ethers } from 'ethers';
import { CallFunction, FunctionOptions, SendFunction } from './function';

export type Call<
  TSignature extends AnyFunction = AnyFunction
> = ProxiedFunction<CallDefinition<TSignature>>;

export type Send<
  TSignature extends AnyFunction = AnyFunction,
  TPayable extends boolean = false
> = ProxiedFunction<SendDefinition<TSignature, TPayable>>;

type AnyFunction = (...args: any) => any;
export type ProxiedFunction<
  TFunction extends FunctionDefinition
> = FullFunction<TFunction> & ShortcutFunction<TFunction>;

export interface FunctionDefinition {
  type: 'call' | 'send';
  signature: (...args: any) => any;
  input: any[];
  output: any;
}

type CallDefinition<TSignature extends AnyFunction = AnyFunction> = {
  type: 'call';
  signature: TSignature;
  input: Parameters<TSignature>;
  output: ReturnType<TSignature>;
};

type SendDefinition<
  TSignature extends AnyFunction = AnyFunction,
  TPayable extends boolean = false
> = {
  type: 'send';
  payable: TPayable;
  signature: TSignature;
  input: Parameters<TSignature>;
  output: ReturnType<TSignature>;
};

type FullFunction<
  TFunction extends FunctionDefinition
> = TFunction extends CallDefinition
  ? CallFunction<TFunction['input'], TFunction['output']>
  : TFunction extends SendDefinition
  ? SendFunction<TFunction['input'], TFunction['output']>
  : never;

type ShortcutFunction<TFunction extends FunctionDefinition> = {
  (...args: TFunction['input']): ShortcutFunctionOutput<TFunction>;
  (options: FunctionOptions<TFunction['input']>): ShortcutFunctionOutput<
    TFunction
  >;
};

type ShortcutFunctionOutput<
  TFunction extends FunctionDefinition
> = TFunction extends CallDefinition
  ? Promise<TFunction['output']>
  : TFunction extends SendDefinition
  ? Promise<ethers.ContractReceipt>
  : never;
