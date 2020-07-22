import { ethers } from 'ethers';
import { DoppelgangerContract } from './doppelganger';
import { ContractFunction } from './function';
import { ConcreteContract, Functions, MockedFunction } from './types';

export type MockContractType<TFunctions extends Functions> = MockContract<
  TFunctions
> &
  {
    [TKey in keyof TFunctions]: TKey extends keyof MockContract<TFunctions>
      ? MockContract<TFunctions>[TKey]
      : MockedFunction<TFunctions[TKey]>;
  };

function stub<TFunctions extends Functions>(
  mock: DoppelgangerContract,
  contract: ConcreteContract<TFunctions>,
  func: ethers.utils.FunctionFragment,
  params?: any[],
) {
  const encoder = ethers.utils.defaultAbiCoder;
  const data = params
    ? contract.abi.encodeFunctionData(func, params)
    : contract.abi.getSighash(func);

  return {
    reverts: () => mock.__doppelganger__mockReverts(data),
    returns: (...args: any) => {
      if (!func.outputs) {
        const formatted = func.format();

        throw new Error(
          `Failed to mock return value of function with no outputs: ${formatted}`,
        );
      }

      const encoded = encoder.encode(func.outputs, args);
      return mock.__doppelganger__mockReturns(data, encoded);
    },
  };
}

export class MockContract<TFunctions extends Functions> {
  constructor(
    public readonly doppelganger: DoppelgangerContract,
    public readonly contract: ConcreteContract<TFunctions>,
  ) {
    const names = Object.values(this.contract.abi.functions).reduce(
      (carry, current) => {
        if (!carry[current.name]) {
          carry[current.name] = current;
        }

        return carry;
      },
      {} as { [name: string]: ethers.utils.FunctionFragment },
    );

    return new Proxy(this, {
      get: (target, prop: string, receiver) => {
        if (prop === 'then' || prop === 'catch' || prop === 'finally') {
          if (!names[prop]) {
            return;
          }
        }

        if (Reflect.has(target, prop)) {
          return Reflect.get(target, prop, receiver);
        }

        const fragment = names[prop] ?? target.contract.abi.getFunction(prop);
        function mock(...args: any) {
          return stub(target.doppelganger, target.contract, fragment, args);
        }

        // Shortcuts for catch-all mocks.
        const shortcuts = stub(target.doppelganger, target.contract, fragment);
        return Object.assign(mock, shortcuts);
      },
    });
  }
}
