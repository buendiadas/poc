import { contract, Functions, Call } from '@crestproject/ethers-contracts';
import { loadArtifact } from './utils';

// prettier-ignore
export type ContractConstructor = (tokenContract: string) => void;

// prettier-ignore
export interface ContractFunctions extends Functions {
  'check': Call<() => boolean>;
  'check()': Call<() => boolean>;
}

export const AmIRichAlready = contract.fromSolidity<
  ContractFunctions,
  ContractConstructor
>(loadArtifact('AmIRichAlready'));
