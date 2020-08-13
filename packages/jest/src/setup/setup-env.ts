import fs from 'fs-extra';
import path from 'path';
import NodeEnvironment from 'jest-environment-node';
import { BuidlerProvider } from '@crestproject/evm';
import {
  BUIDLEREVM_NETWORK_NAME,
  SOLC_INPUT_FILENAME,
  SOLC_OUTPUT_FILENAME,
} from '@nomiclabs/buidler/internal/constants';
import { createProvider as createProviderInternal } from '@nomiclabs/buidler/internal/core/providers/construction';
import {
  BuidlerNetworkConfig,
  EthereumProvider,
  ResolvedBuidlerConfig,
} from '@nomiclabs/buidler/types';
import { config } from '@nomiclabs/buidler';

function createProvider(config: ResolvedBuidlerConfig) {
  const compilerVersion = config.solc.version;
  const pathConfig = config.paths;
  const networkName = BUIDLEREVM_NETWORK_NAME;
  const networkConfig: BuidlerNetworkConfig = {
    ...(config.networks[networkName] as BuidlerNetworkConfig),
    // loggingEnabled: true,
  };

  const provider = createProviderInternal(
    networkName,
    networkConfig,
    compilerVersion,
    pathConfig,
  );

  return provider;
}

async function addCompilationResult(
  config: ResolvedBuidlerConfig,
  provider: BuidlerProvider,
) {
  const compilerVersion = config.solc.version;

  try {
    const [compilerInput, compilerOutput] = await Promise.all([
      fs.readJSON(path.join(config.paths.cache, SOLC_INPUT_FILENAME), {
        encoding: 'utf8',
      }),
      fs.readJSON(path.join(config.paths.cache, SOLC_OUTPUT_FILENAME), {
        encoding: 'utf8',
      }),
    ]);

    return provider.send('buidler_addCompilationResult', [
      compilerVersion,
      compilerInput,
      compilerOutput,
    ]);
  } catch (error) {
    // TODO: Maybe add reporting for this later.
  }
}

export default class CrestProjectEnvironment extends NodeEnvironment {
  public provider?: EthereumProvider;

  constructor(config: any) {
    super(config);
  }

  async setup() {
    await super.setup();

    this.provider = createProvider(config);
    this.global.provider = new BuidlerProvider(createProvider(config));

    await addCompilationResult(config, this.global.provider);
  }

  async teardown() {
    this.provider?.removeAllListeners();
    // TODO: Collect coverage data here if applicable.
    await super.teardown();
  }
}
