import path from 'path';
import { ethers } from 'ethers';
import { generateContractFile } from '..';

describe('code generator', () => {
  it('generates code', () => {
    const contract = require('./contracts/ERC20.json');
    const source = path.resolve(__dirname, 'contracts/ERC20.json');
    const destination = path.resolve(__dirname, 'ERC20.ts');

    let relative = path.relative(path.dirname(destination), source);
    if (!relative.startsWith('.')) {
      relative = `./${relative}`;
    }

    const abi = new ethers.utils.Interface(contract.abi);
    const output = generateContractFile('ERC20', abi, relative);

    expect(output).toMatchSnapshot();
  });
});
