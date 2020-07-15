import {
  contract,
  ContractFunction,
  Functions,
} from '@crestproject/ethers-contracts';

export interface AmIRichAlreadyFunctions extends Functions {
  check: AmIRichAlreadyFunctions['check()'];
  'check()': ContractFunction;
}

export const AmIRichAlready = contract<AmIRichAlreadyFunctions>`
  constructor(address tokenContract)
  function check() view returns (bool)
`;
