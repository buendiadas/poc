import { utils } from 'ethers';
import { network } from 'hardhat';
import { HardhatProvider } from '@crestproject/hardhat';
import { BasicToken } from '@crestproject/artifactory';

const provider = new HardhatProvider(network.provider);

async function snapshot(provider: HardhatProvider) {
  const someone = await provider.getSignerWithAddress(0);
  const signer = await provider.getSignerWithAddress(1);
  const token = await BasicToken.deploy(signer, utils.parseEther('100'));

  return {
    signer,
    someone,
    token,
  };
}

describe('events', () => {
  it('toHaveEmitted', async () => {
    const { token, someone } = await provider.snapshot(snapshot);
    const amount = utils.parseEther('100');

    const tx = token.approve(someone, amount);
    await expect(tx).resolves.toHaveEmitted('Approval');
  });

  it('toHaveEmittedWith', async () => {
    const { token, signer, someone } = await provider.snapshot(snapshot);
    const amount = utils.parseEther('100');

    const tx = token.approve(someone, amount);
    await expect(tx).resolves.toHaveEmittedWith('Approval', {
      owner: signer,
      spender: someone,
      value: amount,
    });
  });
});
