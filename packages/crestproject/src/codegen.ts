import fs from 'fs';
import path from 'path';
import { utils } from 'ethers';
import { formatOutput, generateContract } from '@crestproject/codegen';
import { SolidityCompilerOutput } from '@crestproject/ethers';

export type OutputType = 'artifact' | 'signatures';

export async function generate(source: string, destination: string) {
  const contract: SolidityCompilerOutput = await new Promise(
    (resolve, reject) => {
      fs.readFile(source, 'utf8', (error, data) => {
        error ? reject(error) : resolve(JSON.parse(data));
      });
    },
  );

  const imports = '@crestproject/crestproject';
  const name = path.basename(source).split('.').shift()!;
  const abi = new utils.Interface(contract.abi);
  const content = generateContract(name, contract.bytecode, abi, imports);
  const formatted = formatOutput(content);
  const output = path.join(destination, `${name}.ts`);
  await new Promise((resolve, reject) => {
    fs.writeFile(output, formatted, (error) => {
      error ? reject(error) : resolve();
    });
  });
}
