import NodeEnvironment from 'jest-environment-node';
import { HardhatNetworkConfig, HardhatRuntimeEnvironment } from 'hardhat/types';
import { HardhatProvider } from './provider';
import { hardhat } from './hardhat';

export default class CrestProjectHardhatEnvironment extends NodeEnvironment {
  private config: Partial<HardhatNetworkConfig> = {};
  private hardhat: HardhatRuntimeEnvironment | undefined;

  async setup() {
    await super.setup();

    this.config = (this.global.hardhatNetworkOptions as any) ?? {};
    this.hardhat = await hardhat(this.config);
    this.global.provider = new HardhatProvider(this.hardhat);
  }

  async teardown() {
    this.hardhat?.network.provider.removeAllListeners();

    // TODO: Collect coverage data here if applicable.
    await super.teardown();
  }
}
