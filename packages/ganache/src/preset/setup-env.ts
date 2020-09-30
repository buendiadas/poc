import NodeEnvironment from 'jest-environment-node';
import ganache from 'ganache-core';
import { GanacheProvider } from '@crestproject/ganache';

export default class CrestProjectBuidlerEnvironment extends NodeEnvironment {
  public provider?: ganache.Provider;

  async setup() {
    await super.setup();

    const config: ganache.IProviderOptions = this.global.ganacheProviderOptions;
    this.provider = ganache.provider(config);
    this.global.provider = new GanacheProvider(this.provider);
  }

  async teardown() {
    if (this.provider) {
      await new Promise((resolve) => this.provider!.close(() => resolve()));
    }

    await super.teardown();
  }
}
