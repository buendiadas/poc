import os from 'os';
import fs from 'fs';
import path from 'path';
import throat from 'throat';
import yargs from 'yargs';
import glob from 'glob';
import Worker from 'jest-worker';

export const command = 'codegen <input> <output>';
export const description = 'Generates code for your contracts.';
export const builder = (yargs: yargs.Argv) =>
  yargs
    .positional('input', {
      describe: 'The input file or glob pattern.',
      demandOption: true,
      type: 'string',
    })
    .positional('output', {
      describe: 'The output directory.',
      demandOption: true,
      type: 'string',
    });

type Args = ReturnType<typeof builder>['argv'];

export const handler = async (args: Args) => {
  const cwd = process.cwd();
  const format = args.format;
  const matches = glob.sync(args.input, {
    absolute: true,
    nodir: true,
    cwd,
  });

  if (!matches.length) {
    throw new Error('No files matched the given pattern');
  }

  const destination = path.resolve(cwd, args.output);
  if (!fs.existsSync(destination)) {
    fs.mkdirSync(destination, {
      recursive: true,
    });
  }

  const workerPath = require.resolve('@crestproject/crestproject/codegen');
  const workerCount = Math.max(os.cpus().length - 1, 1);
  const worker = new Worker(workerPath, {
    exposedMethods: ['generate'],
    forkOptions: { stdio: 'pipe' },
    numWorkers: workerCount,
  });

  const mutex = throat(workerCount);
  const run = (match: string, destination: string) => {
    return mutex(async () =>
      (worker as any).generate(match, destination, format),
    );
  };

  const stdout = worker.getStdout();
  if (stdout) {
    stdout.pipe(process.stdout);
  }

  const stderr = worker.getStderr();
  if (stderr) {
    stderr.pipe(process.stderr);
  }

  const runners = matches.map((match) => run(match, destination));
  await Promise.all(runners).finally(() => worker.end());
};
