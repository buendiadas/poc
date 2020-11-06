
import deepmerge from 'deepmerge';
import glob from 'glob';
import path from 'path';
import fs from 'fs-extra';
import { instrumentSources } from '@crestproject/coverage';
import { task, extendConfig } from 'hardhat/config';
import { validateDir } from '../utils';
import type { CodeCoverageConfig } from './types';

export * from './types';

extendConfig((config, userConfig) => {
  const defaults: CodeCoverageConfig = {
    path: path.resolve(config.paths.cache, './coverage'),
    clear: true,
    exclude: [],
    include: [],
  };

  const provided = userConfig.codeCoverage ?? {};
  config.codeCoverage = deepmerge<CodeCoverageConfig>(defaults, provided as any);
  config.codeCoverage.path = validateDir(config.paths.root, config.codeCoverage.path);
});

interface Arguments {
  force: boolean;
}

const description = 'Add code coverage instrumentations statements during compilation';
task<Arguments>('coverage', description, async (args, env) => {
  const config = env.config.codeCoverage;
  const dir = path.resolve(config.path, 'contracts');
  const files = glob.sync('**/*.sol', {
    cwd: env.config.paths.sources,
  });

  // First, grab alles files and their source and target locations.
  const sources = await Promise.all(
    files.map(async (file) => {
      const name = path.basename(file, '.sol');
      const origin = path.resolve(env.config.paths.sources, file);
      const destination = path.resolve(dir, file);
      const source = await fs.readFile(origin, 'utf8');
      const included = config.include.length ? config.include.some((rule) => name.match(rule)) : true;
      const excluded = config.exclude.length ? config.exclude.some((rule) => name.match(rule)) : false;
      const instrument = included && !excluded;

      return {
        source,
        origin,
        destination,
        instrument,
      };
    }),
  );

  // Then create the instrumentation metadata for all matched files.
  const instrumentation = instrumentSources(
    sources.reduce((carry, current) => {
      if (!current.instrument) {
        return carry;
      }

      return { ...carry, [current.origin]: current.source };
    }, {} as Record<string, string>),
  );

  // Prepare the temporary instrumentation source & metadata directory.
  if (config.clear && (await fs.pathExists(config.path))) {
    await fs.remove(config.path);
  }

  // Save each file's instrumented source (or original source if excluded).
  await Promise.all(
    sources.map((file) => {
      const output = instrumentation.instrumented[file.origin]?.instrumented ?? file.source;
      return fs.outputFile(file.destination, output, 'utf8');
    }),
  );

  // Save the metadata for runtime hit collection.
  await fs.outputJson(path.resolve(config.path, 'metadata.json'), instrumentation.metadata, {
    spaces: 2,
  });

  // Move the original compilation cache file out of harms way.
  const cache = path.join(env.config.paths.cache, 'solidity-files-cache.json');
  if (await fs.pathExists(cache)) {
    await fs.move(cache, `${cache}.bkp`, {
      overwrite: true,
    });
  }

  // Override the contract source path for the `compile` task.
  const original = env.config.paths.sources;
  env.config.paths.sources = dir;
  await env.run('compile', args);
  env.config.paths.sources = original;

  // Restore the original compilation cache file.
  if (await fs.pathExists(`${cache}.bkp`)) {
    await fs.move(`${cache}.bkp`, cache, {
      overwrite: true,
    });
  }
}).addFlag('force', 'Force compilation ignoring cache');
