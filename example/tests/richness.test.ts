import { ethers } from 'ethers';
import { BuidlerProvider } from 'crestproject';
import { AmIRichAlready } from './contracts/AmIRichAlready';
import { BasicToken } from './contracts/BasicToken';

async function deploy(provider: BuidlerProvider) {
  const [deployer, other] = await Promise.all([
    provider.getSigner(0),
    provider.getSigner(1),
  ]);

  const balance = ethers.utils.parseEther('100000000000000');
  const token = await BasicToken.deploy(deployer, balance);
  const contract = await AmIRichAlready.deploy(deployer, token.address);

  return {
    balance,
    deployer,
    other,
    token,
    contract,
  };
}

describe('example', () => {
  it('makes the poor rich', async () => {
    const {
      balance,
      contract,
      token,
      deployer,
      other,
    } = await provider.snapshot(deploy);

    const rich = await deployer.getAddress();
    const poor = await other.getAddress();

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

  it('make everyone poor', async () => {
    const {
      balance,
      contract,
      token,
      deployer,
      other,
    } = await provider.snapshot(deploy);

    const rich = await deployer.getAddress();
    const poor = await other.getAddress();

    const stranger = '0x0000000000000000000000000000000000000001';
    await token.transfer(stranger, balance);
    await expect(token.balanceOf(poor)).resolves.toEqBigNumber(0);
    await expect(token.balanceOf(rich)).resolves.toEqBigNumber(0);

    const check = contract.check;
    await expect(check.from(poor).call()).resolves.toBeFalsy();
    await expect(check.from(rich).call()).resolves.toBeFalsy();
  });
});
