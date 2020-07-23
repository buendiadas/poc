import { ethers } from 'ethers';
import { Contract } from './contract';
import { CallFunction, FunctionOptions, SendFunction } from './function';
import { MockContract } from './mock';

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
  TParent extends SpecializedContract<{}> = SpecializedContract<{}>
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

export type ProxyFunction<
  TFunction extends FunctionDefinition,
  TParent extends SpecializedContract<{}> = SpecializedContract<{}>
> = {
  contract: TParent;
  (...args: TFunction['input']): ShortcutFunctionOutput<TFunction>;
  (options: FunctionOptions<TFunction['input']>): ShortcutFunctionOutput<
    TFunction
  >;
} & FullFunction<TFunction>;

export type MockFunction<TFunction extends FunctionDefinition> = {
  (...args: TFunction['input']): MockFunctionStub;
} & MockFunctionStub;

export type MockFunctionStub = {
  returns(...output: any): Promise<ethers.ContractReceipt>;
  reverts(): Promise<ethers.ContractReceipt>;
};

export interface ContractBase<TFunctions extends Functions = {}> {
  signer?: ethers.Signer;
  provider?: ethers.providers.Provider;
  abi: ethers.utils.Interface;
  address: string;
  attach(address: string): SpecializedContract<TFunctions>;
  connect(
    provider: ethers.Signer | ethers.providers.Provider,
  ): SpecializedContract<TFunctions>;
}

export type SpecializedContract<TFunctions extends Functions = {}> = Contract &
  {
    [TKey in keyof TFunctions]: TKey extends keyof ContractBase<TFunctions>
      ? ContractBase<TFunctions>[TKey]
      : ProxyFunction<TFunctions[TKey], SpecializedContract<TFunctions>>;
  };

export type SpecializedMockContract<
  TFunctions extends Functions = {}
> = MockContract<TFunctions> &
  {
    [TKey in keyof TFunctions]: TKey extends keyof MockContract<TFunctions>
      ? MockContract<TFunctions>[TKey]
      : MockFunction<TFunctions[TKey]>;
  };
