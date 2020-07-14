import { contract } from './construction';
import { Functions } from './types';
import { SendFunction, ContractFunction } from './function';
import { ethers } from 'ethers';
import { Contract } from './contract';

describe('contract tagged template literals', () => {
  interface TokenFunctions extends Functions {
    'allowance': TokenFunctions['allowance(address,address)'];
    'allowance(address,address)': ContractFunction<[owner: string, spender: string], ethers.BigNumber>;
    'allowance(address,uint)': ContractFunction<[owner: string, how: number], ethers.BigNumber>;
    'approve(address,uint)': SendFunction<[spender: string, amount: number], boolean>;
    'decimals': TokenFunctions['decimals()']
    'decimals()': ContractFunction<never, ethers.BigNumber>;
    'name': TokenFunctions['name()']
    'name()': ContractFunction<never, string>;
    'symbol': TokenFunctions['symbol()']
    'symbol()': ContractFunction<never, string>;
    'transfer': TokenFunctions['transfer(address,uint256)'];
    'transfer(address,uint256)': SendFunction<[to: string, amount: number]>;
  }

  const Token = contract<TokenFunctions>`
    function allowance(address owner, address spender) view returns (uint256)
    function allowance(address owner, uint how) view returns (uint256)
    function approve(address spender, uint256 amount) returns (bool)
    function decimals() view returns (uint8)
    function name() view returns (string)
    function symbol() view returns (string)
    function transfer(address recipient, uint256 amount) returns (bool)
  `;

  it('factory creates a contract instance', () => {
    const provider = new ethers.providers.JsonRpcProvider();
    expect(new Token('0x', provider)).toBeInstanceOf(Contract);
  });
});
