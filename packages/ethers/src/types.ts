import { Contract } from './contract';
import {
  CallFunction,
  ContractReceipt,
  FunctionOptions,
  SendFunction,
} from './function';

export type Call<
  TSignature extends AnyFunction = AnyFunction,
  TContract extends Contract = Contract
> = ProxiedFunction<CallDefinition<TSignature, TContract>>;

export type Send<
  TSignature extends AnyFunction = AnyFunction,
  TContract extends Contract = Contract
> = ProxiedFunction<SendDefinition<TSignature, TContract>>;

type AnyFunction = (...args: any) => any;
export type ProxiedFunction<
  TFunction extends FunctionDefinition
> = DerivedFunction<TFunction> & ShortcutFunction<TFunction>;

export interface FunctionDefinition {
  type: 'call' | 'send';
  signature: (...args: any) => any;
  contract: Contract;
  input: any[];
  output: any;
}

type CallDefinition<
  TSignature extends AnyFunction = AnyFunction,
  TContract extends Contract = Contract
> = {
  type: 'call';
  signature: TSignature;
  contract: TContract;
  input: Parameters<TSignature>;
  output: ReturnType<TSignature>;
};

type SendDefinition<
  TSignature extends AnyFunction = AnyFunction,
  TContract extends Contract = Contract
> = {
  type: 'send';
  signature: TSignature;
  contract: TContract;
  input: Parameters<TSignature>;
  output: ReturnType<TSignature>;
};

type DerivedFunction<
  TFunction extends FunctionDefinition
> = TFunction extends CallDefinition
  ? DerivedCallFunction<TFunction>
  : TFunction extends SendDefinition
  ? DerivedSendFunction<TFunction>
  : never;

type DerivedSendFunction<TFunction extends SendDefinition> = SendFunction<
  TFunction['input'],
  TFunction['output'],
  TFunction['contract']
>;

type DerivedCallFunction<TFunction extends CallDefinition> = CallFunction<
  TFunction['input'],
  TFunction['output'],
  TFunction['contract']
>;

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
  ? Promise<ContractReceipt<DerivedSendFunction<TFunction>>>
  : never;
