import { ethers } from 'ethers';
import { JsonFragment } from '@ethersproject/abi';
import { Contract } from './contract';
import {
  ConstructorFunction,
  FunctionOptions,
  resolveFunctionOptions,
} from './function';
import {
  DoppelgangerCompilerOutput,
  DoppelgangerConstructor,
  DoppelgangerFunctions,
} from './doppelganger';
import {
  Functions,
  AnyFunction,
  SpecializedContract,
  SpecializedMockContract,
} from './types';
import { MockContract } from './mock';
import { ensureInterface } from './utils';

export interface SolidityCompilerOutput {
  abi: JsonFragment[];
  bytecode?: string;
}

export interface SpecializedContractFactory<
  TFunctions extends Functions = {},
  TConstructor extends AnyFunction = () => void
> {
  deploy(
    signer: ethers.Signer,
    ...args: Parameters<TConstructor>
  ): Promise<SpecializedContract<TFunctions>>;
  deploy(
    signer: ethers.Signer,
    options: FunctionOptions<Parameters<TConstructor>>,
  ): Promise<SpecializedContract<TFunctions>>;
  mock(signer: ethers.Signer): Promise<SpecializedMockContract<TFunctions>>;
  new (
    address?: string,
    provider?: ethers.Signer | ethers.providers.Provider,
  ): SpecializedContract<TFunctions>;
}

export class ContractFactory {
  public readonly doppelganger: SpecializedContractFactory<
    DoppelgangerFunctions,
    DoppelgangerConstructor
  >;

  public constructor() {
    this.doppelganger = this.fromSolidity(DoppelgangerCompilerOutput);
  }

  public createFactory<
    TFunctions extends Functions = {},
    TConstructor extends AnyFunction = () => void
  >(
    fragments: string | (ethers.utils.Fragment | string)[],
    bytecode?: string,
    defaultProvider?: ethers.Signer | ethers.providers.Provider,
  ) {
    const factory = this;

    const CurrentContract = class extends Contract {
      public static deploy(
        signer: ethers.Signer,
        ...args: Parameters<TConstructor>
      ): Promise<SpecializedContract<TFunctions>>;
      public static deploy(
        signer: ethers.Signer,
        options: FunctionOptions<Parameters<TConstructor>>,
      ): Promise<SpecializedContract<TFunctions>>;
      public static deploy(signer: ethers.Signer, ...args: any) {
        const options = resolveFunctionOptions(...args);
        const contract = new CurrentContract(
          undefined,
          signer,
        ) as SpecializedContract;
        const constructor = contract.abi.deploy;
        const fn = new ConstructorFunction(contract, constructor, options);

        const hex = ethers.utils.hexlify(bytecode ?? '', {
          allowMissingPrefix: true,
        });

        return fn.bytecode(hex).send();
      }

      public static async mock(
        signer: ethers.Signer,
      ): Promise<SpecializedMockContract<TFunctions>> {
        const doppelganger = await factory.doppelganger.deploy(signer);
        const contract = new CurrentContract(doppelganger.address, signer);
        return new MockContract<TFunctions>(
          doppelganger,
          contract as any,
        ) as SpecializedMockContract<TFunctions>;
      }

      constructor(
        address: string = '0x',
        provider?: ethers.Signer | ethers.providers.Provider,
      ) {
        super(ensureInterface(fragments), address, provider ?? defaultProvider);
      }

      public attach(address: string): SpecializedContract<TFunctions> {
        const provider = this.signer ?? this.provider;
        return new CurrentContract(address, provider) as SpecializedContract<
          TFunctions
        >;
      }

      public connect(
        provider: ethers.Signer | ethers.providers.Provider,
      ): SpecializedContract<TFunctions> {
        return new CurrentContract(
          this.address,
          provider,
        ) as SpecializedContract<TFunctions>;
      }
    };

    return (CurrentContract as unknown) as SpecializedContractFactory<
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
    const bytecode = json?.bytecode;

    return this.createFactory<TFunctions, TConstructor>(
      abi,
      bytecode,
      provider,
    );
  }
}

// Expose a default contract factory for convenience.
export const contract = new ContractFactory();
