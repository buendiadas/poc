import { createCoverageMap, createFileCoverage } from "istanbul-lib-coverage";
import { InstrumentationMetadata } from "./instrument";

export function createCoverageCollector(metadata: InstrumentationMetadata, recording: Record<string, number>) {
  const instrumentation = metadata.instrumentations ?? {};
  return (info: any) => {
    if (info.opcode.name === 'PUSH1' && info.stack.length > 0) {
      const hash = toHex(info.stack[info.stack.length - 1].toString(16));
      if (instrumentation[hash]) {
        recording[hash] = (recording[hash] ?? 0) + 1;
      }
    }
  };
}

export function mergeCoverageReports(recording: Record<string, number>, metadata: InstrumentationMetadata) {
  // Set up the coverage map using for all contracts.
  const coverage = createCoverageMap();
  Object.keys(metadata.targets).forEach((contract) => {
    const file = createFileCoverage({
      path: contract,
      fnMap: metadata.targets[contract].functions as any,
      branchMap: metadata.targets[contract].branches as any,
      statementMap: metadata.targets[contract].statements as any,
      f: {},
      s: {},
      b: {},
    });

    Object.keys(metadata.targets[contract].functions).map((key) => {
      file.f[key] = 0;
    });

    Object.keys(metadata.targets[contract].statements).map((key) => {
      file.s[key] = 0;
    });

    Object.entries(metadata.targets[contract].branches).map(([key, branch]) => {
      file.b[key] = branch.locations.map(() => 0);
    });

    coverage.addFileCoverage(file);
  });

  // Collect all the coverage data by looping through the recorded hits.
  Object.entries(recording).forEach(([hash, hits]) => {
    const instrumentation = metadata.instrumentations[hash];
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

  return coverage;
}

function toHex(value: string) {
  // If negative, prepend the negative sign to the normalized positive value.
  if (value[0] === '-') {
    // Strip off the negative sign.
    value = value.substring(1);
    // Call toHex on the positive component.
    value = toHex(value);

    // Do not allow "-0x00".
    if (value === '0x00') {
      return value;
    }

    // Negate the value.
    return '-' + value;
  }

  // Add a "0x" prefix if missing.
  if (value.substring(0, 2) !== '0x') {
    value = '0x' + value;
  }

  // Normalize zero.
  if (value === '0x') {
    return '0x00';
  }

  // Make the string even length.
  if (value.length % 2) {
    value = '0x0' + value.substring(2);
  }

  // Trim to smallest even-length string.
  while (value.length > 4 && value.substring(0, 4) === '0x00') {
    value = '0x' + value.substring(4);
  }

  return value;
}
