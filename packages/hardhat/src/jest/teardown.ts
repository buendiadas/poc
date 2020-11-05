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
      fnMap: metadata.contracts[contract].functions as any,
      branchMap: metadata.contracts[contract].branches as any,
      statementMap: metadata.contracts[contract].statements as any,
      f: {},
      s: {},
      b: {},
    });

    Object.keys(metadata.contracts[contract].functions).map((key) => {
      file.f[key] = 0;
    });

    Object.keys(metadata.contracts[contract].statements).map((key) => {
      file.s[key] = 0;
    });

    Object.entries(metadata.contracts[contract].branches).map(([key, branch]) => {
      file.b[key] = branch.locations.map(() => 0);
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
        file.f[instrumentation.id] += hits;
        return;
      }

      case 'statement': {
        file.s[instrumentation.id] += hits;
        return;
      }

      case 'branch': {
        const before = file.b[instrumentation.id][instrumentation.branch] ?? 0;
        file.b[instrumentation.id][instrumentation.branch] = before + hits;
        return;
      }
    }
  });

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
