import { providers } from 'ethers';
import { network } from '@nomiclabs/buidler';
import { EthereumProvider } from '@nomiclabs/buidler/types';

export class BuidlerProvider extends providers.JsonRpcProvider {
  constructor(public readonly provider: EthereumProvider) {
    super();
  }

  public send(method: string, params: any): Promise<any> {
    return this.provider.send(method, params);
  }
}

export const provider = new BuidlerProvider(network.provider);
