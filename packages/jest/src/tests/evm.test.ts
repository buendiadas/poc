import { network } from '@nomiclabs/buidler';
import { BuidlerProvider } from '@crestproject/evm';
import { ERC20 } from './contracts/ERC20';

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

describe('evm', () => {
  const provider = new BuidlerProvider(network.provider);

  it('toHaveBeenCalledOnContract', async () => {
    const { token, name } = await provider.snapshot(snapshot);

    await expect(token.name()).resolves.toBe(name);
    expect(token.name).toHaveBeenCalledOnContract();
  });

  it('toHaveBeenCalledOnContractWith', async () => {
    const { token, someone } = await provider.snapshot(snapshot);

    await expect(token.balanceOf(someone)).resolves.toBeTruthy();
    expect(token.balanceOf).toHaveBeenCalledOnContractWith(someone);
  });
});
