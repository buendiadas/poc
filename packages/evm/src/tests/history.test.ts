import { network } from '@nomiclabs/buidler';
import { BuidlerProvider } from '../provider';
import { ERC20 } from './contracts/ERC20';

const provider = new BuidlerProvider(network.provider);

describe('buidler evm history tracking', () => {
  it('records history of contract calls', async () => {
    const deployer = provider.getSigner(0);
    const token = await ERC20.deploy(deployer, 'Test Token', 'TEST');

    await expect(token.decimals()).resolves.toBe(18);
    expect(provider.history.calls(token.address).length).toBe(1);

    await expect(token.decimals()).resolves.toBe(18);
    expect(provider.history.calls(token.address).length).toBe(2);

    const encoded = token.abi.encodeFunctionData(token.decimals.fragment);
    expect(provider.history.calls(token.address).shift()).toEqual(encoded);
  });
});
