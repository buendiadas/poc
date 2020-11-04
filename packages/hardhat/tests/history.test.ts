import { utils } from 'ethers';
import { BasicToken } from '@crestproject/artifactory';
import { EthereumTestnetProvider } from '@crestproject/crestproject';

async function snapshot(provider: EthereumTestnetProvider) {
  const deployer = await provider.getSignerWithAddress(0);
  return BasicToken.deploy(deployer, utils.parseEther('100'));
}

describe('hardhat evm history tracking', () => {
  it('records history of contract calls', async () => {
    const deployer = await provider.getSignerWithAddress(0);
    const token = await BasicToken.deploy(deployer, utils.parseEther('100'));

    await expect(token.decimals()).resolves.toBe(18);
    expect(provider.history.calls(token).length).toBe(1);

    await expect(token.decimals()).resolves.toBe(18);
    expect(provider.history.calls(token).length).toBe(2);

    const sighash = utils.id(token.decimals.fragment.format()).slice(0, 10);
    const call = provider.history.calls(token).pop();
    expect(call).toEqual(sighash);
  });

  it('history is in sync with snapshot', async () => {
    let token = await provider.snapshot(snapshot);
    await expect(token.decimals()).resolves.toBe(18);
    expect(provider.history.calls(token).length).toBe(1);

    await expect(token.decimals()).resolves.toBe(18);
    expect(provider.history.calls(token).length).toBe(2);

    token = await provider.snapshot(snapshot);
    expect(provider.history.calls(token).length).toBe(0);
  });
});
