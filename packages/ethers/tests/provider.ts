import { network } from '@nomiclabs/buidler';
import { EthereumProvider } from '@nomiclabs/buidler/types';
import { ethers } from 'ethers';

export class BuidlerProvider extends ethers.providers.JsonRpcProvider {
  constructor(public readonly provider: EthereumProvider) {
    super();
  }

  public send(method: string, params: any): Promise<any> {
    return this.provider.send(method, params);
  }
}

export const provider = new BuidlerProvider(network.provider);
