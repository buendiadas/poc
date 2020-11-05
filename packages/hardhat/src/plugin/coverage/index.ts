import deepmerge from 'deepmerge';
import glob from 'glob';
import path from 'path';
import fs from 'fs-extra';
import { task, extendConfig } from 'hardhat/config';
import { validateDir } from '../utils';
import { instrument } from '../../coverage';
import type { CodeCoverageConfig, CodeCoverageMetadata } from './types';

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

const description = 'Add code coverage instrumentation statements during compilation';
task<Arguments>('coverage', description, async (args, env) => {
  const config = env.config.codeCoverage;
  const dir = path.resolve(config.path, 'contracts');
  const files = glob.sync('**/*.sol', {
    cwd: env.config.paths.sources,
  });

  const sources = await Promise.all(
    files.map(async (file) => {
      const name = path.basename(file, '.sol');
      const origin = path.resolve(env.config.paths.sources, file);
      const destination = path.resolve(dir, file);
      const source = await fs.readFile(origin, 'utf8');
      const included = config.include.length ? config.include.some((rule) => name.match(rule)) : true;
      const excluded = config.exclude.length ? config.exclude.some((rule) => name.match(rule)) : false;
      let instrumented = included && !excluded ? await instrument(source, origin) : undefined;

      // Remove all files with no instrumentation (e.g. interfaces).
      if (instrumented && Object.keys(instrumented.instrumentation).length === 0) {
        instrumented = undefined;
      }

      return {
        file,
        name,
        source,
        origin,
        destination,
        instrumented,
      };
    }),
  );

  if (!sources.some((source) => source.instrumented)) {
    console.warn(`None of the source contract artifacts matched your include/exclude rules for code generation.`);
  }

  if (config.clear && (await fs.pathExists(config.path))) {
    await fs.remove(config.path);
  }

  await Promise.all(
    sources.map((file) => {
      const output = file.instrumented?.instrumented ?? file.source;
      return fs.outputFile(file.destination, output, 'utf8');
    }),
  );

  // Write coverage collection metadata to be used by the runtime.
  const metadata = sources.reduce(
    (carry, current) => {
      if (!current.instrumented) {
        return carry;
      }

      carry.instrumentation = {
        ...carry.instrumentation,
        ...current.instrumented.instrumentation,
      };

      carry.contracts[current.origin] = {
        path: current.origin,
        functions: current.instrumented?.functions ?? [],
        statements: current.instrumented?.statements ?? [],
        branches: current.instrumented?.branches ?? [],
      };

      return carry;
    },
    {
      contracts: {},
      instrumentation: {},
    } as CodeCoverageMetadata,
  );

  await fs.outputJson(path.resolve(config.path, 'metadata.json'), metadata, {
    spaces: 2,
  });

  // Move the original cache file out of harms way.
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

  // Restore the original cache file.
  if (await fs.pathExists(`${cache}.bkp`)) {
    await fs.move(`${cache}.bkp`, cache, {
      overwrite: true,
    });
  }
}).addFlag('force', 'Force compilation ignoring cache');
