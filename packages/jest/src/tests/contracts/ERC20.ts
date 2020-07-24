/* eslint-disable */
import { ethers } from 'ethers';
import { contract, Call, Send, AddressLike, Contract } from '@crestproject/ethers';

export type ERC20Args = [name: string, symbol: string];

// prettier-ignore
export interface ERC20 extends Contract<ERC20> {
  // Shortcuts (using function name of first overload)
  allowance: Call<(owner: AddressLike, spender: AddressLike) => ethers.BigNumber>
  approve: Send<(spender: AddressLike, amount: ethers.BigNumberish) => boolean>
  balanceOf: Call<(account: AddressLike) => ethers.BigNumber>
  decimals: Call<() => ethers.BigNumber>
  decreaseAllowance: Send<(spender: AddressLike, subtractedValue: ethers.BigNumberish) => boolean>
  increaseAllowance: Send<(spender: AddressLike, addedValue: ethers.BigNumberish) => boolean>
  name: Call<() => string>
  symbol: Call<() => string>
  totalSupply: Call<() => ethers.BigNumber>
  transfer: Send<(recipient: AddressLike, amount: ethers.BigNumberish) => boolean>
  transferFrom: Send<(sender: AddressLike, recipient: AddressLike, amount: ethers.BigNumberish) => boolean>

  // Explicit accessors (using full function signature)
  'allowance(address,address)': Call<(owner: AddressLike, spender: AddressLike) => ethers.BigNumber>
  'approve(address,uint256)': Send<(spender: AddressLike, amount: ethers.BigNumberish) => boolean>
  'balanceOf(address)': Call<(account: AddressLike) => ethers.BigNumber>
  'decimals()': Call<() => ethers.BigNumber>
  'decreaseAllowance(address,uint256)': Send<(spender: AddressLike, subtractedValue: ethers.BigNumberish) => boolean>
  'increaseAllowance(address,uint256)': Send<(spender: AddressLike, addedValue: ethers.BigNumberish) => boolean>
  'name()': Call<() => string>
  'symbol()': Call<() => string>
  'totalSupply()': Call<() => ethers.BigNumber>
  'transfer(address,uint256)': Send<(recipient: AddressLike, amount: ethers.BigNumberish) => boolean>
  'transferFrom(address,address,uint256)': Send<(sender: AddressLike, recipient: AddressLike, amount: ethers.BigNumberish) => boolean>
}

export const ERC20 = contract.fromSolidity<ERC20, ERC20Args>(require('../artifacts/ERC20.json'));