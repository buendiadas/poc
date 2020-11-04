import glob from 'glob';
import path from 'path';
import fs from 'fs-extra';
import Reporter from 'istanbul-lib-report';
import Reports from 'istanbul-reports';
import { Config } from '@jest/types';
import { createCoverageMap, createFileCoverage } from 'istanbul-lib-coverage';
import { CodeCoverageMetadata, CodeCoverageRuntimeRecording } from '../plugin/coverage/types';

export default async (config: Config.GlobalConfig) => {
  if (!process.env.__HARDHAT_COVERAGE_TEMPDIR__) {
    return;
  }

  const tmp = process.env.__HARDHAT_COVERAGE_TEMPDIR__ as string;
  if (!(await fs.pathExists(tmp))) {
    return;
  }

  const files = glob.sync(path.join(tmp, '*.json'));
  const outputs: CodeCoverageRuntimeRecording[] = await Promise.all(files.map((file) => fs.readJson(file)));
  if (!outputs.length) {
    return;
  }

  const unique = outputs.map((item) => item.metadata).filter((item, index, array) => array.indexOf(item) === index);
  if (unique.length !== 1) {
    throw new Error('Mismatching code coverage metadata');
  }

  const metadata: CodeCoverageMetadata = await fs.readJson(unique[0]);

  // Set up the coverage map using for all contracts.
  const coverage = createCoverageMap();
  Object.keys(metadata.contracts).forEach((contract) => {
    const file = createFileCoverage({
      path: contract,
      fnMap: metadata.contracts[contract].functions,
      branchMap: metadata.contracts[contract].branches,
      statementMap: metadata.contracts[contract].statements,
      f: {},
      b: {},
      s: {},
    });

    coverage.addFileCoverage(file);
  });

  // Flatten the hits from all emitted outputs.
  const hits = outputs.reduce((carry, current) => {
    Object.entries(current.hits).forEach(([hash, hits]) => {
      carry[hash] = (carry[hash] ?? 0) + hits;
    });

    return carry;
  }, {} as Record<string, number>);

  // Collect all the coverage data by looping through the recorded hits.
  Object.entries(hits).forEach(([hash, hits]) => {
    const instrumentation = metadata.instrumentation[hash];
    const file = coverage.fileCoverageFor(instrumentation.target);

    switch (instrumentation.type) {
      case 'function': {
        const before = file.f[instrumentation.id] ?? 0;
        file.f[instrumentation.id] = before + hits;
        return;
      }

      case 'statement': {
        const before = file.s[instrumentation.id] ?? 0;
        file.s[instrumentation.id] = before + hits;
        return;
      }

      case 'branch': {
        file.b[instrumentation.id] = file.b[instrumentation.id] ?? [0, 0];
        const before = file.b[instrumentation.id][instrumentation.locationId!];
        file.b[instrumentation.id][instrumentation.locationId!] = before + hits;
        return;
      }

      case 'requirePre': {
        file.b[instrumentation.id] = file.b[instrumentation.id] ?? [0, 0];
        const before = file.b[instrumentation.id][0];
        file.b[instrumentation.id][0] = before + hits;
        return;
      }

      case 'requirePost': {
        file.b[instrumentation.id] = file.b[instrumentation.id] ?? [0, 0];
        const before = file.b[instrumentation.id][1];
        file.b[instrumentation.id][1] = before + hits;
        return;
      }

      default: {
        console.log(instrumentation);
      }
    }
  });

  console.log(JSON.stringify(coverage.toJSON(), undefined, 4));

  const context = Reporter.createContext({
    dir: config.coverageDirectory,
    coverageMap: coverage,
    watermarks: {
      statements: [50, 80],
      functions: [50, 80],
      branches: [50, 80],
      lines: [50, 80],
    },
  });

  config.coverageReporters.forEach((reporter) => {
    const report = Reports.create(reporter as any);
    (report as any).execute(context);
  });

  await fs.emptyDir(tmp);
};
