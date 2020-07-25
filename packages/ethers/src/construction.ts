import { ethers } from 'ethers';
import { JsonFragment } from '@ethersproject/abi';
import { FunctionOptions } from './function';
import { Contract, PossibleInterface, deploy } from './contract';
import { mock, MockContract } from './mock';

export interface SolidityCompilerOutput {
  abi: JsonFragment[];
  bytecode?: string;
}

export interface ContractFactory<
  TContract extends Contract = Contract,
  TConstructorArgs extends any[] = []
> {
  mock(signer: ethers.Signer): Promise<MockContract<TContract>>;
  deploy(signer: ethers.Signer, ...args: TConstructorArgs): Promise<TContract>;
  deploy(
    signer: ethers.Signer,
    options: FunctionOptions<TConstructorArgs>,
  ): Promise<TContract>;
  new (
    address?: string,
    provider?: ethers.Signer | ethers.providers.Provider,
  ): TContract;
}

export class GenericContractFactory {
  public createFactory<
    TContract extends Contract = Contract,
    TConstructorArgs extends any[] = []
  >(abi: ethers.utils.Interface | PossibleInterface, bytecode?: string) {
    class SpecializedContract extends Contract<TContract> {
      public static deploy(signer: ethers.Signer, ...args: TConstructorArgs) {
        const address = ethers.constants.AddressZero;
        const contract = new SpecializedContract(address, signer) as TContract;
        return deploy(contract, bytecode ?? '0x', ...args);
      }

      public static mock(signer: ethers.Signer) {
        const address = ethers.constants.AddressZero;
        const contract = new SpecializedContract(address, signer) as TContract;
        return mock(contract);
      }

      constructor(
        address: string,
        provider: ethers.Signer | ethers.providers.Provider,
      ) {
        super(abi, address, provider);
      }

      public clone(
        address: string,
        provider: ethers.Signer | ethers.providers.Provider,
      ): TContract {
        return new SpecializedContract(address, provider) as TContract;
      }
    }

    return (SpecializedContract as any) as ContractFactory<
      TContract,
      TConstructorArgs
    >;
  }

  public fromSignature<TContract extends Contract = Contract>(
    signatures: TemplateStringsArray,
  ) {
    const trimmed = signatures
      .join('')
      .trim()
      .split('\n')
      .map((item) => item.trim());

    return this.createFactory<TContract>(trimmed);
  }

  public fromSolidity<
    TContract extends Contract = Contract,
    TConstructorArgs extends any[] = []
  >(artifact: SolidityCompilerOutput) {
    const json = typeof artifact === 'string' ? JSON.parse(artifact) : artifact;
    const abi = json?.abi;
    const bytecode = json?.bytecode;
    return this.createFactory<TContract, TConstructorArgs>(abi, bytecode);
  }
}

// Expose a default contract factory for convenience.
export const contract = new GenericContractFactory();
