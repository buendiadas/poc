import { utils } from 'ethers';
import { network } from 'hardhat';
import { BasicToken } from '@crestproject/artifactory';
import { HardhatProvider } from '../src/provider';

const provider = new HardhatProvider(network.provider);

function snapshot(provider: HardhatProvider) {
  const deployer = provider.getSigner(0);
  return BasicToken.deploy(deployer, utils.parseEther('100'));
}

describe('hardhat evm history tracking', () => {
  it('records history of contract calls', async () => {
    const deployer = provider.getSigner(0);
    const token = await BasicToken.deploy(deployer, utils.parseEther('100'));

    await expect(token.decimals()).resolves.toBe(18);
    expect(provider.history.calls(token).length).toBe(1);

    await expect(token.decimals()).resolves.toBe(18);
    expect(provider.history.calls(token).length).toBe(2);

    const encoded = token.abi.encodeFunctionData(token.decimals.fragment);
    expect(provider.history.calls(token).shift()).toEqual(encoded);
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
