import {
  contract,
  ConstructorFunction,
  ContractFunction,
  Functions,
} from '@crestproject/ethers-contracts';

// prettier-ignore
export interface AmIRichAlreadyFunctions extends Functions {
  'constructor': ConstructorFunction;
  'constructor()': ConstructorFunction;
  'check': ContractFunction;
  'check()': ContractFunction;
}

export const AmIRichAlready = contract<AmIRichAlreadyFunctions>`
  constructor(address tokenContract)
  function check() view returns (bool)
`;
