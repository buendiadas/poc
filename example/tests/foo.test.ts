import { ethers } from 'ethers';
import { AmIRichAlready } from './contracts/AmIRichAlready';
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

describe('foo', () => {
  const provider = new BuidlerEthersProvider(network.provider);

  it('bar', async () => {
    const contract = new AmIRichAlready('0x', provider);
    await expect(contract.check()).resolves.toBeTruthy();
  });
});
