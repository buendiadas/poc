/* eslint-disable */
import { ethers } from 'ethers';
import {
  contract,
  Call,
  Send,
  Functions,
} from '@crestproject/ethers-contracts';

export type BasicTokenConstructor = (
  initialBalance: ethers.BigNumberish,
) => void;

export interface BasicTokenFunctions extends Functions {
  allowance: Call<(owner: string, spender: string) => ethers.BigNumber>;
  'allowance(address,address)': Call<
    (owner: string, spender: string) => ethers.BigNumber
  >;
  approve: Send<(spender: string, amount: ethers.BigNumberish) => boolean>;
  'approve(address,uint256)': Send<
    (spender: string, amount: ethers.BigNumberish) => boolean
  >;
  balanceOf: Call<(account: string) => ethers.BigNumber>;
  'balanceOf(address)': Call<(account: string) => ethers.BigNumber>;
  decimals: Call<() => ethers.BigNumber>;
  'decimals()': Call<() => ethers.BigNumber>;
  decreaseAllowance: Send<
    (spender: string, subtractedValue: ethers.BigNumberish) => boolean
  >;
  'decreaseAllowance(address,uint256)': Send<
    (spender: string, subtractedValue: ethers.BigNumberish) => boolean
  >;
  increaseAllowance: Send<
    (spender: string, addedValue: ethers.BigNumberish) => boolean
  >;
  'increaseAllowance(address,uint256)': Send<
    (spender: string, addedValue: ethers.BigNumberish) => boolean
  >;
  name: Call<() => string>;
  'name()': Call<() => string>;
  symbol: Call<() => string>;
  'symbol()': Call<() => string>;
  totalSupply: Call<() => ethers.BigNumber>;
  'totalSupply()': Call<() => ethers.BigNumber>;
  transfer: Send<(recipient: string, amount: ethers.BigNumberish) => boolean>;
  'transfer(address,uint256)': Send<
    (recipient: string, amount: ethers.BigNumberish) => boolean
  >;
  transferFrom: Send<
    (sender: string, recipient: string, amount: ethers.BigNumberish) => boolean
  >;
  'transferFrom(address,address,uint256)': Send<
    (sender: string, recipient: string, amount: ethers.BigNumberish) => boolean
  >;
}

export const BasicToken = contract.fromSolidity<
  BasicTokenFunctions,
  BasicTokenConstructor
>(require('../../packages/crestproject/codegen'));
