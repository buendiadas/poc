import NodeEnvironment from 'jest-environment-node';
import { config, artifacts } from 'hardhat';
import { HardhatProvider } from '@crestproject/hardhat';
import {
  hardhatNetworkName,
  createProvider as createProviderInternal,
  HardhatNetworkConfig,
  EthereumProvider,
  HardhatConfig,
} from './imports';

function createProvider(config: HardhatConfig) {
  const pathConfig = config.paths;
  const networkName = hardhatNetworkName;
  const networkConfig: HardhatNetworkConfig = {
    ...(config.networks[networkName] as HardhatNetworkConfig),
    // loggingEnabled: true,
  };

  const provider = createProviderInternal(
    networkName,
    networkConfig,
    pathConfig,
    artifacts,
  );

  return provider;
}

export default class CrestProjectHardhatEnvironment extends NodeEnvironment {
  public provider?: EthereumProvider;

  async setup() {
    await super.setup();

    this.provider = createProvider(config);
    this.global.provider = new HardhatProvider(createProvider(config));
  }

  async teardown() {
    if (this.provider) {
      this.provider.removeAllListeners();
    }

    // TODO: Collect coverage data here if applicable.
    await super.teardown();
  }
}
