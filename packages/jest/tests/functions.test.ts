import { HardhatProvider } from '@crestproject/hardhat';
import { BasicToken } from '@crestproject/artifactory';
import { utils } from 'ethers';

async function snapshot(provider: HardhatProvider) {
  const deployer = await provider.getSignerWithAddress(0);
  const someone = await provider.getSignerWithAddress(1);
  const signer = await provider.getSignerWithAddress(2);
  const token = await BasicToken.deploy(signer, utils.parseEther('100'));

  return {
    deployer,
    someone,
    token,
  };
}

describe('functions', () => {
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
