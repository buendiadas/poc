/* eslint-disable */
import { ethers } from 'ethers';
import {
  contract,
  Call,
  Send,
  Functions,
} from '@crestproject/ethers-contracts';

export type IERC20Constructor = () => void;

export interface IERC20Functions extends Functions {
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

export const IERC20 = contract.fromSolidity<IERC20Functions, IERC20Constructor>(
  require('../../packages/crestproject/codegen'),
);
