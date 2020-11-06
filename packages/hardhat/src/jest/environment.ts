import fs from 'fs-extra';
import path from 'path';
import deepmerge from 'deepmerge';
import NodeEnvironment from 'jest-environment-node';
import { v4 as uuid } from 'uuid';
import { Config } from '@jest/types';
import { createCoverageCollector } from '@crestproject/coverage';
import { HardhatNetworkConfig } from 'hardhat/types';
import { HardhatProvider } from '../provider';
import { hardhat } from '../hardhat';
import { addListener } from '../helpers';

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

  private testOptions: HardhatTestOptions;
  private hardhatProvider?: HardhatProvider;
  private runtimeRecording: Record<string, number> = {};

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
      addListener(env.network.provider, 'step', createCoverageCollector(metadata, this.runtimeRecording));
    }
  }

  async teardown() {
    if (this.testOptions.coverage && Object.keys(this.runtimeRecording).length) {
      const file = path.join(this.tempDir, `${uuid()}.json`);
      const output = {
        metadata: this.metadataFilePath,
        hits: this.runtimeRecording,
      };

      await fs.outputJson(file, output, {
        spaces: 2,
      });
    }

    await super.teardown();
  }
}
