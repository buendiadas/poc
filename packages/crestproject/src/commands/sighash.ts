import fs from 'fs';
import path from 'path';
import yargs from 'yargs';
import glob from 'glob';
import { ethers } from 'ethers';
import { SolidityCompilerOutput } from '@crestproject/ethers';

export const command = 'sighash <sighash> <abis>';
export const description = 'Finds all functions matching the given sighash.';
export const builder = (yargs: yargs.Argv) =>
  yargs
    .positional('sighash', {
      describe: 'The sighash to search for.',
      demandOption: true,
      type: 'string',
    })
    .positional('abis', {
      describe: 'The input file or glob pattern.',
      demandOption: true,
      type: 'string',
    });

type Args = ReturnType<typeof builder>['argv'];

export const handler = async (args: Args) => {
  const cwd = process.cwd();
  const abis = glob.sync(args.abis, {
    absolute: true,
    nodir: true,
    cwd,
  });

  if (!abis.length) {
    throw new Error('No files matched the given pattern');
  }

  const sighash = ethers.utils.hexlify(ethers.BigNumber.from(args.sighash));
  const matches = abis.map(async (source) => {
    const contract: SolidityCompilerOutput = await new Promise(
      (resolve, reject) => {
        fs.readFile(source, 'utf8', (error, data) => {
          error ? reject(error) : resolve(JSON.parse(data));
        });
      },
    );

    const abi = new ethers.utils.Interface(contract.abi);
    const basename = path.basename(source);
    const candidates = Object.values(abi.functions)
      .filter((fragment) => abi.getSighash(fragment) === sighash)
      .map((item) => `${basename}: ${item.format()}`);

    return candidates;
  });

  const flattened = (await Promise.all(matches)).flat();
  if (!flattened.length) {
    console.log('No matches');
  } else {
    console.log(`Found ${flattened.length} matches:\n`);
    flattened.forEach((item) => console.log(item));
  }
};
