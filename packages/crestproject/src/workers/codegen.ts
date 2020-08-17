import fs from 'fs';
import path from 'path';
import { ethers } from 'ethers';
import {
  generateContractForSolidityArtifact,
  generateContractForSignatures,
} from '@crestproject/codegen';
import { SolidityCompilerOutput } from '@crestproject/ethers';
import { formatOutput } from '../../../codegen/dist';

export type OutputType = 'artifact' | 'signatures';

export async function generate(
  source: string,
  destination: string,
  type: OutputType,
) {
  const contract: SolidityCompilerOutput = await new Promise(
    (resolve, reject) => {
      fs.readFile(source, 'utf8', (error, data) => {
        error ? reject(error) : resolve(JSON.parse(data));
      });
    },
  );

  const imports = '@crestproject/crestproject';
  const name = path.basename(source).split('.').shift()!;
  const abi = new ethers.utils.Interface(contract.abi);

  let content: string;
  if (type === 'signatures') {
    content = generateContractForSignatures(name, abi, imports);
  } else {
    let relative = path.relative(destination, source);
    if (!relative.startsWith('.')) {
      relative = `./${relative}`;
    }

    content = generateContractForSolidityArtifact(name, relative, abi, imports);
  }

  const formatted = formatOutput(content);
  const output = path.join(destination, `${name}.ts`);
  await new Promise((resolve, reject) => {
    fs.writeFile(output, formatted, (error) => {
      error ? reject(error) : resolve();
    });
  });
}
