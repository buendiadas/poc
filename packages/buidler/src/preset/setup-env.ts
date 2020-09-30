import NodeEnvironment from 'jest-environment-node';
import { config } from '@nomiclabs/buidler';
import { BuidlerProvider, addCompilationResult } from '@crestproject/buidler';
import {
  buidlerNetworkName,
  createProvider as createProviderInternal,
  BuidlerNetworkConfig,
  EthereumProvider,
  ResolvedBuidlerConfig,
} from '../imports';

function createProvider(config: ResolvedBuidlerConfig) {
  const compilerVersion = config.solc.version;
  const pathConfig = config.paths;
  const networkName = buidlerNetworkName;
  const networkConfig: BuidlerNetworkConfig = {
    ...(config.networks[networkName] as BuidlerNetworkConfig),
    // loggingEnabled: true,
  };

  const provider = createProviderInternal(
    networkName,
    networkConfig,
    compilerVersion,
    pathConfig
  );

  return provider;
}

export default class CrestProjectBuidlerEnvironment extends NodeEnvironment {
  public provider?: EthereumProvider;

  async setup() {
    await super.setup();

    this.provider = createProvider(config);
    this.global.provider = new BuidlerProvider(createProvider(config));

    const buidlerConfigs: string[] = this.global.buidlerConfigs ?? [];
    await Promise.all(
      buidlerConfigs.map((config) => {
        return addCompilationResult(config, this.global.provider);
      })
    );
  }

  async teardown() {
    if (this.provider) {
      this.provider.removeAllListeners();
    }

    // TODO: Collect coverage data here if applicable.
    await super.teardown();
  }
}
