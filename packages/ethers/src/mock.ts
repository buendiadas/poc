import { ethers } from 'ethers';
import { Contract } from './contract';
import { Doppelganger } from './doppelganger';
import { ContractFunction } from './function';
import { ProxiedFunction } from './types';

function stub<TContract extends Contract = Contract>(
  doppelganger: Doppelganger,
  contract: TContract,
  func: ethers.utils.FunctionFragment,
  params?: any[],
) {
  const encoder = ethers.utils.defaultAbiCoder;
  const data = params
    ? contract.abi.encodeFunctionData(func, params)
    : contract.abi.getSighash(func);

  return {
    given: (...input: any) => stub(doppelganger, contract, func, input),
    reverts: () => doppelganger.__doppelganger__mockReverts(data),
    returns: (...output: any) => {
      if (!func.outputs) {
        const formatted = func.format();

        throw new Error(
          `Attempting to mock return value of function with no outputs: ${formatted}`,
        );
      }

      const encoded = encoder.encode(func.outputs, output);
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

  const doppelganger = await Doppelganger.deploy(contract.signer);
  const mocked = contract.attach(doppelganger.address);
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
};

export type Stub<TOutput extends any[] = any[]> = {
  returns(...args: TOutput): Promise<ethers.ContractReceipt>;
  reverts(): Promise<ethers.ContractReceipt>;
};

export type RefinableStub<
  TInput extends any[] = any[],
  TOutput extends any[] = any[]
> = Stub<TOutput> & {
  given(...args: TInput): Stub<TOutput>;
};
