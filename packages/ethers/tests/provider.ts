import { providers } from 'ethers';
import { network } from 'hardhat';
import { EthereumProvider } from 'hardhat/types';

export class HardhatProvider extends providers.JsonRpcProvider {
  constructor(public readonly provider: EthereumProvider) {
    super();
  }

  public send(method: string, params: any): Promise<any> {
    return this.provider.send(method, params);
  }
}

export const provider = new HardhatProvider(network.provider);
