import { network } from '@nomiclabs/buidler';
import { ERC20 } from '@crestproject/artifactory';
import { BuidlerProvider } from '../src/provider';

const provider = new BuidlerProvider(network.provider);

function snapshot(provider: BuidlerProvider) {
  const deployer = provider.getSigner(0);
  return ERC20.deploy(deployer, 'Test Token', 'TEST');
}

describe('buidler evm history tracking', () => {
  it('records history of contract calls', async () => {
    const deployer = provider.getSigner(0);
    const token = await ERC20.deploy(deployer, 'Test Token', 'TEST');

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
