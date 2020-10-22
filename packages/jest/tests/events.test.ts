import { utils } from 'ethers';
import { network } from 'hardhat';
import { HardhatProvider } from '@crestproject/hardhat';
import { BasicToken } from '@crestproject/artifactory';

const provider = new HardhatProvider(network.provider);

async function snapshot(provider: HardhatProvider) {
  const [deployer, someone] = await provider.listAccounts();
  const signer = provider.getSigner(deployer);
  const token = await BasicToken.deploy(signer, utils.parseEther('100'));

  return {
    deployer,
    someone,
    token,
  };
}

let tx;

describe('events', () => {
  it('toHaveEmitted', async () => {
    const { token, someone } = await provider.snapshot(snapshot);
    const amount = utils.parseEther('100');

    tx = token.approve(someone, amount);
    await expect(tx).resolves.toHaveEmitted('Approval');
  });

  it('toHaveEmittedWith', async () => {
    const { token, deployer, someone } = await provider.snapshot(snapshot);
    const amount = utils.parseEther('100');

    tx = token.approve(someone, amount);
    await expect(tx).resolves.toHaveEmittedWith('Approval', (matches) => {
      matches.forEach((match) => {
        expect(match.args).toMatchObject({
          owner: deployer,
          spender: someone,
          value: amount,
        });
      });
    });
  });
});
