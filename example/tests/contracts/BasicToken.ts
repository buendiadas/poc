import {
  contract,
  Call,
  Functions,
  Send,
} from '@crestproject/ethers-contracts';
import { ethers } from 'ethers';

function bytecode(name: string) {
  const json = require(`../../build/${name}.json`);
  return `0x${json.bytecode}`;
}

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

// prettier-ignore
export const BasicToken = contract(bytecode('BasicToken'))<ContractFunctions, ContractConstructor>`
  constructor(uint256 initialBalance)
  function allowance(address owner, address spender) view returns (uint256)
  function allowance(address owner, uint how) view returns (uint256)
  function approve(address spender, uint256 amount) returns (bool)
  function balanceOf(address account) view returns (uint256)
  function decimals() view returns (uint8)
  function name() view returns (string)
  function symbol() view returns (string)
  function transfer(address recipient, uint256 amount) returns (bool)
`;
