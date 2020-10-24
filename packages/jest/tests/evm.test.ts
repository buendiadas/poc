import { network } from 'hardhat';
import { HardhatProvider } from '@crestproject/hardhat';
import { BasicToken } from '@crestproject/artifactory';
import { utils } from 'ethers';
import { randomAddress } from '@crestproject/ethers';

async function snapshot(provider: HardhatProvider) {
  const [deployer, someone] = await provider.listAccounts();
  const signer = provider.getSigner(deployer);

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
  const provider = new HardhatProvider(network.provider);

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

  fit('toHaveBeenCalledOnContractWith shows last used arguments on mismatch', async () => {
    const { token } = await provider.snapshot(snapshot);

    const usedSpender = randomAddress();
    const usedOwner = randomAddress();

    const expectedSpender = randomAddress();
    const expectedOwner = randomAddress();

    await token.allowance(usedOwner, usedSpender);
    await expect(token.allowance).toHaveBeenCalledOnContractWith(
      expectedOwner,
      expectedSpender
    );
  });

  it('toHaveBeenCalledOnContract works with mocks', async () => {
    const { mock, someone } = await provider.snapshot(snapshot);

    await mock.name.returns('mock token');
    await expect(mock.name()).resolves.toBe('mock token');
    expect(mock.name).toHaveBeenCalledOnContract();

    await mock.transfer.given(someone, '123').returns(true);
    await expect(
      mock.transfer.args(someone, '123').call()
    ).resolves.toBeTruthy();

    expect(mock.transfer).toHaveBeenCalledOnContract();
    await expect(mock.transfer).toHaveBeenCalledOnContractWith(someone, '123');

    await mock.transfer.given(someone, '456').returns(true);
    await expect(mock.transfer(someone, '456')).resolves.toBeReceipt();
    await expect(mock.transfer).toHaveBeenCalledOnContractWith(someone, '456');
  });
});
