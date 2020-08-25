import { ethers, utils } from 'ethers';
import { Contract } from './contract';
import { Doppelganger } from './doppelganger';
import {
  ContractFunction,
  CallFunction,
  SendFunction,
  ContractReceipt,
  ConstructorFunction,
} from './function';
import { ProxiedFunction } from './types';
import { resolveArguments } from './utils';

function stub<TContract extends Contract = Contract>(
  doppelganger: Doppelganger,
  contract: TContract,
  func: ethers.utils.FunctionFragment,
  params?: any[],
) {
  const encoder = ethers.utils.defaultAbiCoder;

  return {
    given: (...input: any) => stub(doppelganger, contract, func, input),
    reset: async () => {
      const args = params
        ? await resolveArguments(func.inputs ?? [], params)
        : undefined;

      const data = args
        ? contract.abi.encodeFunctionData(func, args)
        : contract.abi.getSighash(func);

      return doppelganger.__doppelganger__mockReset(data);
    },
    reverts: async (reason: string) => {
      const args = params
        ? await resolveArguments(func.inputs ?? [], params)
        : undefined;

      const data = args
        ? contract.abi.encodeFunctionData(func, args)
        : contract.abi.getSighash(func);

      return doppelganger.__doppelganger__mockReverts(data, reason);
    },
    returns: async (...output: any) => {
      if (!func.outputs) {
        const formatted = func.format();

        throw new Error(
          `Attempting to mock return value of function with no outputs: ${formatted}`,
        );
      }

      const args = params
        ? await resolveArguments(func.inputs ?? [], params)
        : undefined;

      const data = args
        ? contract.abi.encodeFunctionData(func, args)
        : contract.abi.getSighash(func);

      const resolved = output?.length
        ? await resolveArguments(func.outputs ?? [], output)
        : undefined;

      const encoded = encoder.encode(func.outputs ?? [], resolved);
      return doppelganger.__doppelganger__mockReturns(data, encoded);
    },
  };
}

export async function mock<TContract extends Contract = Contract>(
  contract: TContract,
): Promise<MockContract<TContract>> {
  if (!contract.signer) {
    throw new Error('Missing signer');
  }

  const functions = Object.values(contract.abi.functions);
  const hashes = functions.map((fragment) => contract.abi.getSighash(fragment));
  const signatures = functions.map((fragment) => fragment.format());
  const doppelganger = await Doppelganger.deploy(
    contract.signer,
    hashes,
    signatures,
  );

  async function forward<
    TArgs extends any[] = any,
    TReturn = any,
    TContract extends Contract = Contract
  >(
    subject:
      | SendFunction<TArgs, TReturn, TContract>
      | CallFunction<TArgs, TReturn, TContract>,
    ...params: any
  ): Promise<any> {
    const fn =
      subject instanceof ContractFunction
        ? subject
        : typeof subject === 'function' &&
          (subject as ContractFunction).ref instanceof ContractFunction
        ? (subject as ContractFunction).ref
        : undefined;

    if (fn == null) {
      throw new Error('Not a valid contract function');
    }

    if (fn instanceof ConstructorFunction) {
      throw new Error('Constructor functions are not supported');
    }

    const fragment = fn.fragment as utils.FunctionFragment;
    const callee = fn.contract;

    const args = params
      ? await resolveArguments(fragment.inputs, params)
      : undefined;

    const data = args
      ? fn.contract.abi.encodeFunctionData(fragment, args)
      : fn.contract.abi.getSighash(fragment);

    const forward = doppelganger.__doppelganger__mockForward.args(data, callee);
    if (fn instanceof SendFunction) {
      const receipt = (await forward.send()) as any;
      const refined: ContractReceipt<SendFunction<
        TArgs,
        TReturn,
        TContract
      >> = receipt;
      refined.function = fn;
      return refined;
    }

    const result = await forward.call();
    const decoded = fn.contract.abi.decodeFunctionResult(fragment, result);
    if (fragment.outputs?.length === 1) {
      return decoded[0];
    }

    return decoded;
  }

  const mocked = contract.attach(doppelganger.address);
  (mocked as any).forward = forward;

  const proxy = new Proxy(mocked, {
    get: (target, prop: string, receiver) => {
      const value = Reflect.get(target, prop, receiver);
      const fn = value?.ref;
      if (!(fn instanceof ContractFunction)) {
        return value;
      }

      const extend = stub(doppelganger, mocked, fn.fragment);
      return new Proxy(value, {
        get: (target, prop, receiver) => {
          if (Reflect.has(target, prop)) {
            return Reflect.get(target, prop, receiver);
          }

          return Reflect.get(extend, prop, receiver);
        },
      });
    },
  });

  return proxy as MockContract<TContract>;
}

export type MockContract<TContract extends Contract = Contract> = {
  [TKey in keyof TContract]: TContract[TKey] extends ProxiedFunction<any>
    ? TContract[TKey] & RefinableStub<Parameters<TContract[TKey]['args']>>
    : TContract[TKey];
} & {
  forward<
    TArgs extends any[] = any,
    TReturn = any,
    TContract extends Contract = Contract
  >(
    send: SendFunction<TArgs, TReturn, TContract>,
    ...args: TArgs
  ): Promise<ContractReceipt<SendFunction<TArgs, TReturn, TContract>>>;
  forward<TArgs extends any[] = any, TReturn = any>(
    call: CallFunction<TArgs, TReturn>,
    ...args: TArgs
  ): Promise<TReturn>;
};

export type Stub<TOutput extends any[] = any[]> = {
  returns(...args: TOutput): Promise<ethers.ContractReceipt>;
  reverts(reason: string): Promise<ethers.ContractReceipt>;
  reset(): Promise<ethers.ContractReceipt>;
};

export type RefinableStub<
  TInput extends any[] = any[],
  TOutput extends any[] = any[]
> = Stub<TOutput> & {
  given(...args: TInput): Stub<TOutput>;
  reset(): Promise<ethers.ContractReceipt>;
};
