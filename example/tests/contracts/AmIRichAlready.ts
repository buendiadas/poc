import { contract, Functions, Call } from '@crestproject/ethers-contracts';

function bytecode(name: string) {
  const json = require(`../../build/${name}.json`);
  return `0x${json.bytecode}`;
}

// prettier-ignore
export type ContractConstructor = (tokenContract: string) => void;

// prettier-ignore
export interface ContractFunctions extends Functions {
  'check': Call<() => boolean>;
  'check()': Call<() => boolean>;
}

// prettier-ignore
export const AmIRichAlready = contract(bytecode('AmIRichAlready'))<ContractFunctions, ContractConstructor>`
  constructor(address tokenContract)
  function check() view returns (bool)
`;
