import NodeEnvironment from 'jest-environment-node';
import { network } from '@nomiclabs/buidler';
import { BuidlerProvider } from '@crestproject/evm';

export default class CrestProjectEnvironment extends NodeEnvironment {
  constructor(config: any) {
    super(config);
  }

  async setup() {
    await super.setup();

    this.global.provider = new BuidlerProvider(network.provider);
  }

  async teardown() {
    // TODO: Collect coverage data here if applicable.
    await super.teardown();
  }
}
