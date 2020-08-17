import path from 'path';
import { ethers } from 'ethers';
import { formatOutput } from '../utils';
import {
  generateContractForSolidityArtifact,
  generateContractForSignatures,
} from '../generate';

describe('code generator', () => {
  it('generates code for solidity artifacts', () => {
    const contract = require('./contracts/ERC20.json');
    const source = path.resolve(__dirname, 'contracts/ERC20.json');
    const destination = path.resolve(__dirname, 'ERC20.ts');

    let relative = path.relative(path.dirname(destination), source);
    if (!relative.startsWith('.')) {
      relative = `./${relative}`;
    }

    const abi = new ethers.utils.Interface(contract.abi);
    const output = generateContractForSolidityArtifact('ERC20', relative, abi);
    const formatted = formatOutput(output);

    expect(formatted).toMatchSnapshot();
  });

  it('generates code for ethers signatures', () => {
    const contract = require('./contracts/ERC20.json');
    const abi = new ethers.utils.Interface(contract.abi);
    const output = generateContractForSignatures('ERC20', abi);
    const formatted = formatOutput(output);

    expect(formatted).toMatchSnapshot();
  });
});
