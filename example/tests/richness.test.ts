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

describe('example', () => {
  const provider = new BuidlerEthersProvider(network.provider);

  it('makes the poor rich', async () => {
    const signer = provider.getSigner(0);
    const balance = ethers.utils.parseEther('100000000000000');
    const token = await BasicToken.deploy(signer, balance);
    const contract = await AmIRichAlready.deploy(signer, token.address);

    const rich = await signer.getAddress();
    const poor = await provider.getSigner(1).getAddress();
    const check = contract.check;
    await expect(check.from(rich).call()).resolves.toBeTruthy();
    await expect(check.from(poor).call()).resolves.toBeFalsy();

    const richness = ethers.utils.parseEther('10000000');
    await token.transfer(poor, richness);
    await expect(check.from(poor).call()).resolves.toBeTruthy();
    await expect(check.from(rich).call()).resolves.toBeTruthy();

    await expect(token.transfer(poor, balance)).rejects.toBeRevertedWith(
      'transfer amount exceeds balance',
    );

    const remaining = balance.sub(richness);
    await expect(token.transfer(poor, remaining)).resolves.toBeReceipt();
    await expect(token.balanceOf(rich)).resolves.toEqBigNumber('0');
  });
});
