import type { EthereumProvider } from 'hardhat/types';
import { EthereumTestnetProvider } from '@crestproject/evm';
import { addListener } from './helpers';

export class HardhatProvider extends EthereumTestnetProvider {
  constructor(public readonly provider: EthereumProvider) {
    super();

    // Re-route call history recording to whatever is the currently
    // active history object. Required for making history and snapshoting
    // work nicely together.
    addListener(provider, 'beforeMessage', (message) => {
      this.history.record(message);
    });
  }

  public send(method: string, params: any): Promise<any> {
    return this.provider.send(method, params);
  }
}
