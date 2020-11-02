import { constants, providers, utils, Signer } from 'ethers';
import { JsonFragment } from '@ethersproject/abi';
import { FunctionOptions } from './function';
import { Contract, deploy } from './contract';
import { mock, MockContract } from './mock';
import { AddressLike } from './types';
import { ensureInterface } from './utils/ensureInterface';

export interface SolidityCompilerOutput {
  abi: JsonFragment[];
  bytecode?: string;
}

export interface ContractFactory<TContract extends Contract = Contract, TConstructorArgs extends any[] = []> {
  abi: utils.Interface;
  mock(signer: Signer): Promise<MockContract<TContract>>;
  deploy(signer: Signer, ...args: TConstructorArgs): Promise<TContract>;
  deploy(signer: Signer, options: FunctionOptions<TConstructorArgs>): Promise<TContract>;
  new (address: AddressLike, provider: Signer | providers.Provider): TContract;
}

// Expose a default contract factory for convenience.
export function contract<TContract extends Contract = Contract, TConstructorArgs extends any[] = never>(
  bytecode?: string,
) {
  return (signatures: TemplateStringsArray) => {
    let resolved: utils.Interface;

    class SpecializedContract extends Contract<TContract> {
      public static get bytecode() {
        return bytecode;
      }

      public static get abi() {
        if (resolved == null) {
          const abi = signatures
            .join('')
            .trim()
            .split('\n')
            .map((item) => item.trim());

          resolved = ensureInterface(abi);
        }

        return resolved;
      }

      public static async deploy(signer: Signer, ...args: TConstructorArgs) {
        const address = constants.AddressZero;
        const contract = new SpecializedContract(address, signer) as TContract;
        const receipt = await deploy(contract, bytecode ?? '0x', ...args);
        const instance = contract.attach(receipt.contractAddress);
        instance.deployment = receipt;
        return instance;
      }

      public static mock(signer: Signer) {
        const address = constants.AddressZero;
        const contract = new SpecializedContract(address, signer) as TContract;
        return mock(contract);
      }

      constructor(address: AddressLike, provider: Signer | providers.Provider) {
        super(SpecializedContract.abi, address, provider);
      }

      public clone(address: AddressLike, provider: Signer | providers.Provider): TContract {
        return new SpecializedContract(address, provider) as TContract;
      }
    }

    return (SpecializedContract as any) as ContractFactory<TContract, TConstructorArgs>;
  };
}
