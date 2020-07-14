import { ethers } from 'ethers';
import { Contract } from './contract';
import { Functions, ProxyContract } from './types';

export interface ContractFactory<TFunctions extends Functions> {
  new (
    address: string,
    provider: ethers.Signer | ethers.providers.Provider,
  ): ProxyContract<TFunctions>;
}

export function makeContractFactory<TFunctions extends Functions>(
  fragments: string | (ethers.utils.Fragment | string)[],
  name: string = 'UnnamedContract',
) {
  const ContractFactory = class {
    constructor(
      address: string,
      provider: ethers.Signer | ethers.providers.Provider,
    ) {
      let abi: ethers.utils.Interface;
      if (ethers.utils.Interface.isInterface(fragments)) {
        abi = fragments;
      } else {
        abi = new ethers.utils.Interface(fragments);
      }

      return new Contract<TFunctions>(abi, name, address, provider);
    }
  };

  return ContractFactory as ContractFactory<TFunctions>;
}

export function contract<TFunctions extends Functions>(
  strings: TemplateStringsArray,
) {
  const signatures = strings
    .join('')
    .trim()
    .split('\n')
    .map((item) => item.trim());

  return makeContractFactory<TFunctions>(signatures);
}

contract.named = function <TFunctions extends Functions>(name?: string) {
  return function (strings: TemplateStringsArray) {
    const signatures = strings
      .join('')
      .trim()
      .split('\n')
      .map((item) => item.trim());

    return makeContractFactory<TFunctions>(signatures, name);
  };
};
