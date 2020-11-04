import { utils } from 'ethers';
import { AmIRichAlready, BasicToken } from '@crestproject/artifactory';
import { EthereumTestnetProvider } from '@crestproject/hardhat';

async function snapshot(provider: EthereumTestnetProvider) {
  const someone = await provider.getSignerWithAddress(0);
  const signer = await provider.getSignerWithAddress(1);
  const token = await BasicToken.deploy(signer, utils.parseEther('100'));
  const richness = await AmIRichAlready.deploy(signer, token);

  return {
    someone,
    signer,
    token,
    richness,
  };
}

describe('coverage', () => {
  it('collects coverage data', async () => {
    const { richness } = await provider.snapshot(snapshot);
    await richness.check();
  });
});
