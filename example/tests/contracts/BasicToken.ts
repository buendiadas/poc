import { contract, Functions } from '@crestproject/ethers-contracts';
import { ethers } from 'ethers';

function bytecode(name: string) {
  const json = require(`../../build/${name}.json`);
  return `0x${json.bytecode}`;
}

// prettier-ignore
export type ContractConstructor = (initialBalance: ethers.BigNumberish) => void;

// prettier-ignore
export interface ContractFunctions extends Functions {
}

// prettier-ignore
export const BasicToken = contract(bytecode('BasicToken'))<ContractFunctions, ContractConstructor>`
  constructor(uint256 initialBalance)
`;
