import { ethers } from 'ethers';
import { AmIRichAlready } from './contracts/AmIRichAlready';
import { BasicToken } from './contracts/BasicToken';

describe('example', () => {
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
