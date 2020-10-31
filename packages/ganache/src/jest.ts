import NodeEnvironment from 'jest-environment-node';
import ganache from 'ganache-core';
import { GanacheProvider } from './provider';

export default class CrestProjectHardhatEnvironment extends NodeEnvironment {
  public ganache?: ganache.Provider;
  public provider?: GanacheProvider;

  async setup() {
    await super.setup();

    const config: ganache.IProviderOptions = this.global.ganacheProviderOptions;
    this.ganache = ganache.provider(config);
    this.provider = new GanacheProvider(this.ganache);

    this.global.provider = this.provider;
  }

  async teardown() {
    if (this.ganache) {
      const timeout = this.global.ganacheCloseTimeout ?? 3000;

      await Promise.all([
        new Promise((resolve) => this.ganache!.close(() => resolve())),
        new Promise((resolve) => setTimeout(() => resolve(), timeout)),
      ]);
    }

    await super.teardown();
  }
}
