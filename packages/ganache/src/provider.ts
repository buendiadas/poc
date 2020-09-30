import ganache from 'ganache-core';
import { EthereumTestnetProvider } from '@crestproject/evm';
import { BigNumber, BigNumberish, providers, utils } from 'ethers';
import { addListener } from './vm';

export class GanacheProvider extends EthereumTestnetProvider {
  public readonly gas: BigNumber;
  public readonly adapter: providers.Web3Provider;

  constructor(
    public readonly provider: ganache.Provider,
    gas: BigNumberish = 9500000
  ) {
    super();

    // Avoid calls to eth_estimateGas if a static gas limit is set.
    this.gas = BigNumber.from(gas);
    this.adapter = new providers.Web3Provider(this.provider as any);

    // Re-route call history recording to whatever is the currently
    // active history object. Required for making history and snapshoting
    // work nicely together.
    addListener(this.provider, 'beforeMessage', (message) => {
      this.history.record(message);
    });
  }

  public send(method: string, params: any): Promise<any> {
    return this.adapter.send(method, params);
  }

  public async estimateGas(
    transaction: utils.Deferrable<providers.TransactionRequest>
  ): Promise<BigNumber> {
    if (this.gas && !this.gas.isZero()) {
      return this.gas;
    }

    return super.estimateGas(transaction);
  }
}
