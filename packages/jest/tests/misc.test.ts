import { utils } from 'ethers';
import { BasicToken } from '@crestproject/artifactory';
import { randomAddress } from '@crestproject/ethers';
import { EthereumTestnetProvider } from '@crestproject/hardhat';

async function snapshot(provider: EthereumTestnetProvider) {
  const someone = await provider.getSignerWithAddress(0);
  const signer = await provider.getSignerWithAddress(1);
  const token = await BasicToken.deploy(signer, utils.parseEther('100'));
  const mock = await BasicToken.mock(signer);

  return {
    someone,
    signer,
    token,
    mock,
  };
}

describe('misc', () => {
  it('toBeProperAddress', async () => {
    const address = randomAddress();
    expect(address).toBeProperAddress();
    expect('0x').not.toBeProperAddress();
  });

  it('toMatchAddress', async () => {
    const a = randomAddress();
    const b = randomAddress();
    expect(a).not.toMatchAddress(b);
    expect(a).toMatchAddress(a);
  });

  it('toMatchParams', async () => {
    const { token, signer } = await provider.snapshot(snapshot);
    const params = token.balanceOf.fragment.outputs!;
    const expected = utils.parseEther('100');
    await expect(token.balanceOf(signer)).resolves.toMatchParams(params, expected);
  });
});
