import type { HardhatRuntimeEnvironment } from 'hardhat/types';
import { EthereumTestnetProvider } from '@crestproject/evm';
import { addListener } from './helpers';
import { BigNumber, providers, utils } from 'ethers';

export class HardhatProvider extends EthereumTestnetProvider {
  public readonly gas: undefined | BigNumber;
  public readonly gasPrice: undefined | BigNumber;

  constructor(public readonly env: HardhatRuntimeEnvironment) {
    super();

    if (this.env.network.config.gas !== 'auto') {
      this.gas = BigNumber.from(this.env.network.config.gas).mul(
        this.env.network.config.gasMultiplier,
      );
    }

    if (this.env.network.config.gasPrice !== 'auto') {
      this.gasPrice = BigNumber.from(this.env.network.config.gasPrice);
    }

    // Re-route call history recording to whatever is the currently
    // active history object. Required for making history and snapshoting
    // work nicely together.
    addListener(this.env.network.provider, 'beforeMessage', (message) => {
      this.history.record(message);
    });
  }

  public send(method: string, params: any): Promise<any> {
    return this.env.network.provider.send(method, params);
  }

  public async estimateGas(
    transaction: utils.Deferrable<providers.TransactionRequest>,
  ): Promise<BigNumber> {
    return this.gas ?? super.estimateGas(transaction);
  }

  public async getGasPrice() {
    return this.gasPrice ?? super.getGasPrice();
  }
}
