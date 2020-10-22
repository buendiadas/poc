import fs from 'fs-extra';
import path from 'path';
import glob from 'glob';
import { HardhatProvider } from './provider';
import { validateConfig, resolveConfig, buildInfoDirName } from './imports';

export async function addCompilationResult(
  source: string,
  provider: HardhatProvider
) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const loaded = require(source);
  validateConfig(loaded);

  const config = resolveConfig(source, loaded);
  const dir = path.join(config.paths.artifacts, buildInfoDirName);
  const files = glob.sync('*.json', { cwd: dir, absolute: true });

  await Promise.all(
    files.map(async (file) => {
      const { input, output, solcVersion } = await fs.readJSON(file, {
        encoding: 'utf8',
      });

      await provider.send('hardhat_addCompilationResult', [
        solcVersion,
        input,
        output,
      ]);
    })
  );
}
