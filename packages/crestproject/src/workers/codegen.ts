import fs from 'fs';
import path from 'path';
import { ethers } from 'ethers';
import { generateContractFile } from '@crestproject/codegen';
import { SolidityCompilerOutput } from '@crestproject/ethers';

export async function generate(source: string, destination: string) {
  const contract: SolidityCompilerOutput = await new Promise(
    (resolve, reject) => {
      fs.readFile(source, 'utf8', (error, data) => {
        error ? reject(error) : resolve(JSON.parse(data));
      });
    },
  );

  const name = path.basename(source).split('.').shift()!;
  const abi = new ethers.utils.Interface(contract.abi);

  const relative = path.relative(destination, source);
  const from = `require('${relative}')`;

  const content = generateContractFile(
    name,
    abi,
    from,
    '@crestproject/crestproject',
  );

  const output = path.join(destination, `${name}.ts`);

  await new Promise((resolve, reject) => {
    fs.writeFile(output, content, (error) => {
      error ? reject(error) : resolve();
    });
  });
}
