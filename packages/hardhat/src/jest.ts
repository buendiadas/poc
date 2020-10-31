import NodeEnvironment from 'jest-environment-node';
import { network } from 'hardhat';
import { HardhatProvider } from './provider';

export default class CrestProjectHardhatEnvironment extends NodeEnvironment {
  async setup() {
    await super.setup();

    this.global.provider = new HardhatProvider(network);
  }

  async teardown() {
    network.provider.removeAllListeners();

    // TODO: Collect coverage data here if applicable.
    await super.teardown();
  }
}
