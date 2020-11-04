import fs from 'fs-extra';
import path from 'path';
import deepmerge from 'deepmerge';
import NodeEnvironment from 'jest-environment-node';
import { v4 as uuid } from 'uuid';
import { Config } from '@jest/types';
import { HardhatNetworkConfig } from 'hardhat/types';
import { CodeCoverageRuntimeRecording } from '../plugin/coverage/types';
import { HardhatProvider } from '../provider';
import { addListener } from '../helpers';
import { hardhat } from '../hardhat';

export interface HardhatTestOptions {
  history: boolean;
  coverage: boolean;
  network: Partial<HardhatNetworkConfig>;
}

const defaults = {
  history: true,
  coverage: false,
  network: {},
};

export default class CrestProjectHardhatEnvironment extends NodeEnvironment {
  private metadataFilePath: string = '';
  private tempDir: string = '';

  private hardhatProvider?: HardhatProvider;
  private testOptions: HardhatTestOptions;
  private runtimeRecording: CodeCoverageRuntimeRecording = {
    metadata: '',
    hits: {},
  };

  constructor(config: Config.ProjectConfig) {
    super(config);

    this.testOptions = deepmerge<HardhatTestOptions>(defaults, {
      ...(this.global.hardhatTestOptions as any),
      network: (this.global.hardhatNetworkOptions as any) ?? {},
    });

    this.tempDir = process.env.__HARDHAT_COVERAGE_TEMPDIR__ ?? '';
    if (this.testOptions.coverage && !this.tempDir) {
      throw new Error('Missing shared temporary directory for code coverage data collection');
    }
  }

  async setup() {
    await super.setup();

    const env = await hardhat(this.testOptions.network);
    const config = env.config.codeCoverage;

    this.metadataFilePath = path.join(config.path, 'metadata.json');
    this.hardhatProvider = this.global.provider = new HardhatProvider(env);

    // Re-route call history recording to whatever is the currently
    // active history object. Required for making history and snapshoting
    // work nicely together.
    if (this.testOptions.history) {
      addListener(env.network.provider, 'beforeMessage', (message) => {
        this.hardhatProvider?.history.record(message);
      });
    }

    if (this.testOptions.coverage) {
      const metadata = await fs.readJson(this.metadataFilePath);
      const instrumentation = metadata.instrumentation ?? {};

      this.runtimeRecording.metadata = this.metadataFilePath;
      addListener(env.network.provider, 'step', (info) => {
        if (info.opcode.name === 'PUSH1' && info.stack.length > 0) {
          const hash = toHex(info.stack[info.stack.length - 1].toString(16));
          if (instrumentation[hash]) {
            this.runtimeRecording.hits[hash] = (this.runtimeRecording.hits[hash] ?? 0) + 1;
          }
        }
      });
    }
  }

  async teardown() {
    if (this.testOptions.coverage && Object.keys(this.runtimeRecording.hits).length) {
      const file = path.join(this.tempDir, `${uuid()}.json`);
      await fs.outputJson(file, this.runtimeRecording, {
        spaces: 2,
      });
    }

    await super.teardown();
  }
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
