/* eslint-disable */
import { BigNumber, BigNumberish } from 'ethers';
import {
  contract,
  Call,
  Send,
  AddressLike,
  Contract,
} from '@crestproject/ethers';
import ERC20Artifact from '../artifacts/ERC20.json';

export type ERC20Args = [name: string, symbol: string];

// prettier-ignore
export interface ERC20 extends Contract<ERC20> {
  // Shortcuts (using function name of first overload)
  allowance: Call<(owner: AddressLike, spender: AddressLike) => BigNumber>
  approve: Send<(spender: AddressLike, amount: BigNumberish) => boolean>
  balanceOf: Call<(account: AddressLike) => BigNumber>
  decimals: Call<() => BigNumber>
  decreaseAllowance: Send<(spender: AddressLike, subtractedValue: BigNumberish) => boolean>
  increaseAllowance: Send<(spender: AddressLike, addedValue: BigNumberish) => boolean>
  name: Call<() => string>
  symbol: Call<() => string>
  totalSupply: Call<() => BigNumber>
  transfer: Send<(recipient: AddressLike, amount: BigNumberish) => boolean>
  transferFrom: Send<(sender: AddressLike, recipient: AddressLike, amount: BigNumberish) => boolean>

  // Explicit accessors (using full function signature)
  'allowance(address,address)': Call<(owner: AddressLike, spender: AddressLike) => BigNumber>
  'approve(address,uint256)': Send<(spender: AddressLike, amount: BigNumberish) => boolean>
  'balanceOf(address)': Call<(account: AddressLike) => BigNumber>
  'decimals()': Call<() => BigNumber>
  'decreaseAllowance(address,uint256)': Send<(spender: AddressLike, subtractedValue: BigNumberish) => boolean>
  'increaseAllowance(address,uint256)': Send<(spender: AddressLike, addedValue: BigNumberish) => boolean>
  'name()': Call<() => string>
  'symbol()': Call<() => string>
  'totalSupply()': Call<() => BigNumber>
  'transfer(address,uint256)': Send<(recipient: AddressLike, amount: BigNumberish) => boolean>
  'transferFrom(address,address,uint256)': Send<(sender: AddressLike, recipient: AddressLike, amount: BigNumberish) => boolean>
}

export const ERC20 = contract.fromArtifact<ERC20, ERC20Args>(ERC20Artifact);
