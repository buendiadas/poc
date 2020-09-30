import fs from 'fs-extra';
import path from 'path';
import { BuidlerProvider } from './provider';
import {
  validateConfig,
  resolveConfig,
  defaultConfig,
  solcInputFilename,
  solcOutputFilename,
} from './imports';

export async function addCompilationResult(
  source: string,
  provider: BuidlerProvider
) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const loaded = require(source);
  validateConfig(loaded);

  const config = resolveConfig(source, defaultConfig, loaded, []);
  const inputPath = path.join(config.paths.cache, solcInputFilename);
  const outputPath = path.join(config.paths.cache, solcOutputFilename);
  const compilerVersion = config.solc.version;

  const compilerInput = await fs.readJSON(inputPath, {
    encoding: 'utf8',
  });

  const compilerOutput = await fs.readJSON(outputPath, {
    encoding: 'utf8',
  });

  await provider.send('buidler_addCompilationResult', [
    compilerVersion,
    compilerInput,
    compilerOutput,
  ]);
}
