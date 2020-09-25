import { constants, providers, utils, Signer } from 'ethers';
import { JsonFragment } from '@ethersproject/abi';
import { FunctionOptions } from './function';
import { Contract, deploy } from './contract';
import { mock, MockContract } from './mock';
import { PossibleInterface, ensureInterface } from './utils/ensureInterface';

export interface SolidityCompilerOutput {
  abi: JsonFragment[];
  bytecode?: string;
}

export interface BaseContractFactory<TContract extends Contract = Contract> {
  abi: utils.Interface;
  mock(signer: Signer): Promise<MockContract<TContract>>;
  new (address?: string, provider?: Signer | providers.Provider): TContract;
}

export interface ContractFactory<
  TContract extends Contract = Contract,
  TConstructorArgs extends any[] = []
> extends BaseContractFactory<TContract> {
  deploy(
    signer: Signer,
    bytecode: string,
    ...args: TConstructorArgs
  ): Promise<TContract>;
  deploy(
    signer: Signer,
    bytecode: string,
    options: FunctionOptions<TConstructorArgs>
  ): Promise<TContract>;
}

export interface ContractFactoryWithBytecode<
  TContract extends Contract = Contract,
  TConstructorArgs extends any[] = []
> extends BaseContractFactory<TContract> {
  deploy(signer: Signer, ...args: TConstructorArgs): Promise<TContract>;
  deploy(
    signer: Signer,
    options: FunctionOptions<TConstructorArgs>
  ): Promise<TContract>;
}

export class GenericContractFactory {
  public createFactoryForArtifact<
    TContract extends Contract = Contract,
    TConstructorArgs extends any[] = []
  >(abi: utils.Interface | PossibleInterface, bytecode?: string) {
    let resolved = abi;
    function resolveAbi() {
      return (resolved = ensureInterface(resolved));
    }

    class SpecializedContract extends Contract<TContract> {
      public static get abi() {
        return resolveAbi();
      }

      public static async deploy(signer: Signer, ...args: TConstructorArgs) {
        const address = constants.AddressZero;
        const contract = new SpecializedContract(address, signer) as TContract;
        const receipt = await deploy(contract, bytecode ?? '0x', ...args);
        return contract.attach(receipt.contractAddress);
      }

      public static mock(signer: Signer) {
        const address = constants.AddressZero;
        const contract = new SpecializedContract(address, signer) as TContract;
        return mock(contract);
      }

      constructor(address: string, provider: Signer | providers.Provider) {
        super(SpecializedContract.abi, address, provider);
      }

      public clone(
        address: string,
        provider: Signer | providers.Provider
      ): TContract {
        return new SpecializedContract(address, provider) as TContract;
      }
    }

    return (SpecializedContract as any) as ContractFactory<
      TContract,
      TConstructorArgs
    >;
  }

  public fromSignatures<
    TContract extends Contract = Contract,
    TConstructorArgs extends any[] = []
  >(signatures: TemplateStringsArray) {
    const abi = signatures
      .join('')
      .trim()
      .split('\n')
      .map((item) => item.trim());

    let resolved: utils.Interface;
    function resolveAbi() {
      if (resolved == null) {
        resolved = ensureInterface(abi);
      }

      return resolved;
    }

    class SpecializedContract extends Contract<TContract> {
      public static get abi() {
        return resolveAbi();
      }

      public static async deploy(
        signer: Signer,
        bytecode: string,
        ...args: TConstructorArgs
      ) {
        const address = constants.AddressZero;
        const contract = new SpecializedContract(address, signer) as TContract;
        const receipt = await deploy(contract, bytecode, ...args);
        return contract.attach(receipt.contractAddress);
      }

      public static mock(signer: Signer) {
        const address = constants.AddressZero;
        const contract = new SpecializedContract(address, signer) as TContract;
        return mock(contract);
      }

      constructor(address: string, provider: Signer | providers.Provider) {
        super(SpecializedContract.abi, address, provider);
      }

      public clone(
        address: string,
        provider: Signer | providers.Provider
      ): TContract {
        return new SpecializedContract(address, provider) as TContract;
      }
    }

    return (SpecializedContract as any) as ContractFactory<
      TContract,
      TConstructorArgs
    >;
  }

  public fromArtifact<
    TContract extends Contract = Contract,
    TConstructorArgs extends any[] = []
  >(artifact: SolidityCompilerOutput) {
    const json = typeof artifact === 'string' ? JSON.parse(artifact) : artifact;
    const abi = json?.abi;
    const bytecode = json?.bytecode;

    let resolved: utils.Interface;
    function resolveAbi() {
      if (resolved == null) {
        resolved = ensureInterface(abi);
      }

      return resolved;
    }

    class SpecializedContract extends Contract<TContract> {
      public static get abi() {
        return resolveAbi();
      }

      public static async deploy(signer: Signer, ...args: TConstructorArgs) {
        const address = constants.AddressZero;
        const contract = new SpecializedContract(address, signer) as TContract;
        const receipt = await deploy(contract, bytecode ?? '0x', ...args);
        return contract.attach(receipt.contractAddress);
      }

      public static mock(signer: Signer) {
        const address = constants.AddressZero;
        const contract = new SpecializedContract(address, signer) as TContract;
        return mock(contract);
      }

      constructor(address: string, provider: Signer | providers.Provider) {
        super(SpecializedContract.abi, address, provider);
      }

      public clone(
        address: string,
        provider: Signer | providers.Provider
      ): TContract {
        return new SpecializedContract(address, provider) as TContract;
      }
    }

    return (SpecializedContract as any) as ContractFactoryWithBytecode<
      TContract,
      TConstructorArgs
    >;
  }
}

// Expose a default contract factory for convenience.
export const contract = new GenericContractFactory();
