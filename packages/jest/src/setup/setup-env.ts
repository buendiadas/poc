import { ethers } from 'ethers';
import { network } from '@nomiclabs/buidler';
import { IEthereumProvider } from '@nomiclabs/buidler/types';

export class BuidlerEthersProvider extends ethers.providers.JsonRpcProvider {
  constructor(public readonly provider: IEthereumProvider) {
    super();
  }

  public async send(method: string, params: any): Promise<any> {
    const result = await this.provider.send(method, params);

    // We replicate ethers' behavior.
    this.emit('debug', {
      action: 'send',
      request: {
        id: 42,
        jsonrpc: '2.0',
        method,
        params,
      },
      response: result,
      provider: this,
    });

    return result;
  }
}

const provider = new BuidlerEthersProvider(network.provider);
global.provider = provider;
