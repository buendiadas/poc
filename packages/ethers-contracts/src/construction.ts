import { ethers } from 'ethers';
import { Contract } from './contract';
import {
  ConstructorFunction,
  FunctionOptions,
  resolveFunctionOptions,
} from './function';
import { Functions, ConcreteContract, AnyFunction } from './types';

export type DeferrableByteCode = string | Promise<string>;
export type ByteCodeLoader = DeferrableByteCode | (() => DeferrableByteCode);

function ensureInterface(
  fragments: string | (ethers.utils.Fragment | string)[],
) {
  if (ethers.utils.Interface.isInterface(fragments)) {
    return fragments;
  }

  return new ethers.utils.Interface(fragments);
}

export class ContractFactory {
  public create<
    TFunctions extends Functions = {},
    TConstructor extends AnyFunction = () => void
  >(
    fragments: string | (ethers.utils.Fragment | string)[],
    load?: ByteCodeLoader,
  ) {
    const ConcreteContract = class {
      public static async deploy(
        signer: ethers.Signer,
        ...args: Parameters<TConstructor>
      ): Promise<ConcreteContract<TFunctions>>;
      public static async deploy(
        signer: ethers.Signer,
        options: FunctionOptions<Parameters<TConstructor>>,
      ): Promise<ConcreteContract<TFunctions>>;
      public static async deploy(signer: ethers.Signer, ...args: any) {
        const bytecode = await (typeof load === 'function' ? load() : load);
        if (!bytecode?.startsWith('0x')) {
          throw new Error('Invalid bytecode');
        }

        const options = resolveFunctionOptions(...args);
        const contract = new ConcreteContract('0x', signer) as Contract;
        const constructor = contract.abi.deploy;
        const fn = new ConstructorFunction(contract, constructor, options);
        return fn.bytecode(bytecode).send();
      }

      constructor(
        address: string,
        provider: ethers.Signer | ethers.providers.Provider,
      ) {
        const abi = ensureInterface(fragments);
        return new Contract(abi, address, provider);
      }
    };

    return ConcreteContract as ConcreteContractFactory<
      TFunctions,
      TConstructor
    >;
  }

  public contract(bytecode?: ByteCodeLoader) {
    const factory = this;

    return function contract<
      TFunctions extends Functions = {},
      TConstructor extends AnyFunction = () => void
    >(signatures: TemplateStringsArray) {
      const trimmed = signatures
        .join('')
        .trim()
        .split('\n')
        .map((item) => item.trim());

      return factory.create<TFunctions, TConstructor>(trimmed, bytecode);
    };
  }
}

export interface ConcreteContractFactory<
  TFunctions extends Functions = {},
  TConstructor extends AnyFunction = () => void
> {
  deploy(
    signer: ethers.Signer,
    ...args: Parameters<TConstructor>
  ): Promise<ConcreteContract<TFunctions>>;
  deploy(
    signer: ethers.Signer,
    options: FunctionOptions<Parameters<TConstructor>>,
  ): Promise<ConcreteContract<TFunctions>>;

  new (
    address: string,
    provider: ethers.Signer | ethers.providers.Provider,
  ): ConcreteContract<TFunctions>;
}

// Expose a default contract factory for convenience.
const factory = new ContractFactory();
export const contract = factory.contract.bind(
  factory,
) as ContractFactory['contract'];
