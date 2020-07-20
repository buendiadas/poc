import path from 'path';
import { ethers } from 'ethers';
import { generateContractFile } from '..';

describe('code generator', () => {
  it('generates code', () => {
    const contract = require('./contracts/ERC20.json');
    const source = path.resolve(__dirname, 'contracts/ERC20.json');
    const destination = path.resolve(__dirname, 'ERC20.ts');

    const relative = path.relative(path.dirname(destination), source);
    const from = `require('./${relative}')`;

    const abi = new ethers.utils.Interface(contract.abi);
    const output = generateContractFile('ERC20', abi, from);

    expect(output).toMatchSnapshot();
  });
});
