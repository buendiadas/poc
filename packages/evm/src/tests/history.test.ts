import { network } from '@nomiclabs/buidler';
import { BuidlerProvider } from '../provider';
import { ERC20 } from './contracts/ERC20';

const provider = new BuidlerProvider(network.provider);

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
    const deploy = (provider: BuidlerProvider) => {
      const deployer = provider.getSigner(0);
      return ERC20.deploy(deployer, 'Test Token', 'TEST');
    };

    let token = await provider.snapshot(deploy);
    await expect(token.decimals()).resolves.toBe(18);
    expect(provider.history.calls(token).length).toBe(1);

    await expect(token.decimals()).resolves.toBe(18);
    expect(provider.history.calls(token).length).toBe(2);

    token = await provider.snapshot(deploy);
    expect(provider.history.calls(token).length).toBe(0);
  });
});
