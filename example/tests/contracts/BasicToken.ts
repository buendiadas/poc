import {
  contract,
  Call,
  Functions,
  Send,
} from '@crestproject/ethers-contracts';
import { ethers } from 'ethers';
import { loadArtifact } from './utils';

// prettier-ignore
export type ContractConstructor = (initialBalance: ethers.BigNumberish) => void;

// prettier-ignore
export interface ContractFunctions extends Functions {
  'allowance': Call<(owner: string, spender: string) => ethers.BigNumber>;
  'allowance(address,address)': Call<(owner: string, spender: string) => ethers.BigNumber>;
  'allowance(address,uint)': Call<(owner: string, how: ethers.BigNumberish) => ethers.BigNumber>;
  'approve': Send<(spender: string, amount: ethers.BigNumberish) => boolean>;
  'approve(address,uint)': Send<(spender: string, amount: ethers.BigNumberish) => boolean>;
  'balanceOf': Call<(account: string) => ethers.BigNumber>;
  'balanceOf(address)': Call<(account: string) => ethers.BigNumber>;
  'decimals': Call<() => ethers.BigNumber>;
  'decimals()': Call<() => ethers.BigNumber>;
  'name': Call<() => string>;
  'name()': Call<() => string>;
  'symbol': Call<() => string>;
  'symbol()': Call<() => string>;
  'transfer': Send<(to: string, amount: ethers.BigNumberish) => void>;
  'transfer(address,uint256)': Send<(to: string, amount: ethers.BigNumberish) => void>;
}

export const BasicToken = contract.fromSolidity<
  ContractFunctions,
  ContractConstructor
>(loadArtifact('BasicToken'));
