import { ethers } from 'ethers';
import { AmIRichAlready } from './contracts/AmIRichAlready';

describe('foo', () => {
  it('bar', async () => {
    const provider = new ethers.providers.JsonRpcProvider();
    const contract = new AmIRichAlready('0x', provider);
    await expect(contract.check()).resolves.toBeTruthy();
  });
});
