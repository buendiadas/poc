import { network } from '@nomiclabs/buidler';
import { BuidlerProvider } from '@crestproject/evm';
import { ERC20 } from './contracts/ERC20';

async function snapshot(provider: BuidlerProvider) {
  const [deployer, someone] = await provider.listAccounts();
  const signer = provider.getSigner(deployer);

  const name = 'Test Token';
  const symbol = 'TEST';
  const token = await ERC20.deploy(signer, name, symbol);
  const mock = await ERC20.mock(signer);

  return {
    deployer,
    someone,
    token,
    mock,
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
    await expect(token.balanceOf).toHaveBeenCalledOnContractWith(someone);
  });

  it('toHaveBeenCalledOnContract works with mocks', async () => {
    const { mock, someone } = await provider.snapshot(snapshot);

    await mock.name.returns('mock token');
    await expect(mock.name()).resolves.toBe('mock token');
    expect(mock.name).toHaveBeenCalledOnContract();

    await mock.transfer.given(someone, '123').returns(true);
    await expect(
      mock.transfer.args(someone, '123').call(),
    ).resolves.toBeTruthy();

    expect(mock.transfer).toHaveBeenCalledOnContract();
    await expect(mock.transfer).toHaveBeenCalledOnContractWith(someone, '123');

    await mock.transfer.given(someone, '456').returns(true);
    await expect(mock.transfer(someone, '456')).resolves.toBeReceipt();
    await expect(mock.transfer).toHaveBeenCalledOnContractWith(someone, '456');
  });
});
