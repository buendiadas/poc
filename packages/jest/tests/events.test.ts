import { utils } from 'ethers';
import { network } from '@nomiclabs/buidler';
import { BuidlerProvider } from '@crestproject/buidler';
import { ERC20 } from '@crestproject/artifactory';

const provider = new BuidlerProvider(network.provider);

async function snapshot(provider: BuidlerProvider) {
  const [deployer, someone] = await provider.listAccounts();
  const signer = provider.getSigner(deployer);

  const name = 'Test Token';
  const symbol = 'TEST';
  const token = await ERC20.deploy(signer, name, symbol);

  return {
    deployer,
    someone,
    token,
    name,
    symbol,
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
