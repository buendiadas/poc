import path from 'path';
import { utils } from 'ethers';
import { formatOutput } from '../src/utils';
import {
  generateContractForSolidityArtifact,
  generateContractForSignatures,
} from '../src/generate';

describe('code generator', () => {
  it('generates code for solidity artifacts', () => {
    const contract = require('./__fixtures__/artifact.json');
    const source = require.resolve('./__fixtures__/artifact.json');
    const destination = path.resolve(__dirname, 'ERC20.ts');

    let relative = path.relative(path.dirname(destination), source);
    if (!relative.startsWith('.')) {
      relative = `./${relative}`;
    }

    const abi = new utils.Interface(contract.abi);
    const output = generateContractForSolidityArtifact('ERC20', relative, abi);
    const formatted = formatOutput(output);

    expect(formatted).toMatchSnapshot();
  });

  it('generates code for ethers signatures', () => {
    const contract = require('./__fixtures__/artifact.json');
    const abi = new utils.Interface(contract.abi);
    const output = generateContractForSignatures('ERC20', abi);
    const formatted = formatOutput(output);

    expect(formatted).toMatchSnapshot();
  });
});
