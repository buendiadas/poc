import { network } from '@nomiclabs/buidler';
import { BuidlerProvider } from '@crestproject/buidler';
import { BasicToken } from '@crestproject/artifactory';
import { utils } from 'ethers';

async function snapshot(provider: BuidlerProvider) {
  const [deployer, someone] = await provider.listAccounts();
  const signer = provider.getSigner(deployer);
  const token = await BasicToken.deploy(signer, utils.parseEther('100'));

  return {
    deployer,
    someone,
    token,
  };
}

describe('functions', () => {
  const provider = new BuidlerProvider(network.provider);

  it('toMatchGasSnapshot', async () => {
    const { token, someone } = await provider.snapshot(snapshot);

    const tx = token.transfer(someone, '456');
    await expect(tx).resolves.toMatchGasSnapshot(`51319`);
  });

  it('toCostLessThan', async () => {
    const { token, someone } = await provider.snapshot(snapshot);

    const tx = token.transfer(someone, '456');
    await expect(tx).resolves.toCostLessThan('51319');
  });
});
