import { ethers } from 'ethers';
import { JsonFragment } from '@ethersproject/abi';
import { Contract } from './contract';
import {
  ConstructorFunction,
  FunctionOptions,
  resolveFunctionOptions,
} from './function';
import { Functions, ConcreteContract, AnyFunction } from './types';
import { ensureInterface } from './utils';

export interface SolidityCompilerOutput {
  abi: JsonFragment[];
  bytecode?: string;
  evm?: {
    bytecode?: string;
  };
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
    address?: string,
    provider?: ethers.Signer | ethers.providers.Provider,
  ): ConcreteContract<TFunctions>;
}

export class ContractFactory {
  public createFactory<
    TFunctions extends Functions = {},
    TConstructor extends AnyFunction = () => void
  >(
    fragments: string | (ethers.utils.Fragment | string)[],
    bytecode?: string,
    defaultProvider?: ethers.Signer | ethers.providers.Provider,
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
      public static deploy(signer: ethers.Signer, ...args: any) {
        const options = resolveFunctionOptions(...args);
        const contract = new ConcreteContract(undefined, signer) as Contract;
        const constructor = contract.abi.deploy;
        const fn = new ConstructorFunction(contract, constructor, options);

        const hex = ethers.utils.hexlify(bytecode ?? '', {
          allowMissingPrefix: true,
        });

        return fn.bytecode(hex).send();
      }

      constructor(
        address: string = '0x',
        provider?: ethers.Signer | ethers.providers.Provider,
      ) {
        const abi = ensureInterface(fragments);
        return new Contract(abi, address, provider ?? defaultProvider);
      }
    };

    return ConcreteContract as ConcreteContractFactory<
      TFunctions,
      TConstructor
    >;
  }

  public fromSignature<
    TFunctions extends Functions = {},
    TConstructor extends AnyFunction = () => void
  >(signatures: TemplateStringsArray) {
    const trimmed = signatures
      .join('')
      .trim()
      .split('\n')
      .map((item) => item.trim());

    return this.createFactory<TFunctions, TConstructor>(trimmed);
  }

  public fromSolidity<
    TFunctions extends Functions = {},
    TConstructor extends AnyFunction = () => void
  >(
    artifact: SolidityCompilerOutput,
    provider?: ethers.Signer | ethers.providers.Provider,
  ) {
    const json = typeof artifact === 'string' ? JSON.parse(artifact) : artifact;
    const abi = json?.abi;
    const bytecode = json?.bytecode ?? json?.evm?.bytecode;

    return this.createFactory<TFunctions, TConstructor>(
      abi,
      bytecode,
      provider,
    );
  }
}

// Expose a default contract factory for convenience.
export const contract = new ContractFactory();
