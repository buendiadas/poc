import { BasicToken } from '@crestproject/artifactory';
import { EthereumTestnetProvider } from '@crestproject/evm';
import { utils } from 'ethers';

async function snapshot(provider: EthereumTestnetProvider) {
  const deployer = await provider.getSignerWithAddress(0);
  const someone = await provider.getSignerWithAddress(1);
  const signer = await provider.getSignerWithAddress(2);
  const token = await BasicToken.deploy(signer, utils.parseEther('100'));
  const mock = await BasicToken.mock(signer);

  return {
    deployer,
    someone,
    token,
    mock,
  };
}

describe('evm', () => {
  it('toHaveBeenCalledOnContract', async () => {
    const { token } = await provider.snapshot(snapshot);

    await expect(token.name()).resolves.toBe('Basic');
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
