import { ethers } from 'ethers';
import { AmIRichAlready } from './contracts/AmIRichAlready';
import { network } from '@nomiclabs/buidler';
import { IEthereumProvider } from '@nomiclabs/buidler/types';
import { BasicToken } from './contracts/BasicToken';

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
    const signer = provider.getSigner(0);
    const balance = ethers.utils.parseEther('99999');
    const token = await BasicToken.deploy(signer, balance);
    const contract = await AmIRichAlready.deploy(signer, token.address);
    await expect(contract.check.call()).resolves.toBeFalsy();
  });
});
