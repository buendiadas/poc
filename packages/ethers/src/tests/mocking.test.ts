import { ethers } from 'ethers';
import { Call, Send } from '../types';
import { contract } from '../construction';
import { randomAddress } from '../utils';
import { Contract } from '../contract';
import { provider } from './provider';

describe('contract tagged template literals', () => {
  // prettier-ignore
  interface Token extends Contract<Token> {
    'allowance': Call<(owner: string, spender: string) => ethers.BigNumber>;
    'allowance(address,address)': Call<(owner: string, spender: string) => ethers.BigNumber>;
    'allowance(address,uint)': Call<(owner: string, how: ethers.BigNumberish) => ethers.BigNumber>;
    'approve': Send<(spender: string, amount: ethers.BigNumberish) => boolean>;
    'approve(address,uint)': Send<(spender: string, amount: ethers.BigNumberish) => boolean>;
    'balanceOf': Call<(account: string) => ethers.BigNumber>;
    'balanceOf(address)': Call<(account: string) => ethers.BigNumber>;
    'decimals': Call<() => ethers.BigNumber>;
    'decimals()': Call<() => ethers.BigNumber>;
    'name': Call<() => string>;
    'name()': Call<() => string>;
    'symbol': Call<() => string>;
    'symbol()': Call<() => string>;
    'transfer': Send<(to: string, amount: ethers.BigNumberish) => void>;
    'transfer(address,uint256)': Send<(to: string, amount: ethers.BigNumberish) => void>;
  }

  // prettier-ignore
  const Token = contract.fromSignature<Token>`
    function allowance(address owner, address spender) view returns (uint256)
    function allowance(address owner, uint how) view returns (uint256)
    function approve(address spender, uint256 amount) returns (bool)
    function balanceOf(address account) view returns (uint256)
    function decimals() view returns (uint8)
    function name() view returns (string)
    function symbol() view returns (string)
    function transfer(address recipient, uint256 amount) returns (bool)
  `;

  it('properly deploys the mock contract', async () => {
    const signer = provider.getSigner(0);
    const mock = await Token.mock(signer);
    expect(mock).toBeInstanceOf(Contract);
    expect(mock.address).toMatch(/^0x[0-9-a-fA-F]{40}$/);
  });

  it('can mock contract return values', async () => {
    const signer = provider.getSigner(0);
    const token = await Token.mock(signer);

    await token.balanceOf.returns(123);
    const result = await token.balanceOf(ethers.constants.AddressZero);

    expect(result.toString()).toBe('123');
  });

  it('can mock contract return values with arguments', async () => {
    const signer = provider.getSigner(0);
    const token = await Token.mock(signer);
    const specificAddress = randomAddress();

    await token.balanceOf.returns(123);
    await token.balanceOf.given(specificAddress).returns(456);

    const generic = await token.balanceOf(randomAddress());
    const specific = await token.balanceOf(specificAddress);

    expect(generic.toString()).toBe('123');
    expect(specific.toString()).toBe('456');
  });

  it('can mock reverts', async () => {
    const signer = provider.getSigner(0);
    const mock = await Token.mock(signer);

    await mock.balanceOf
      .given(ethers.constants.AddressZero)
      .reverts('YOU SHALL NOT PASS!');

    await expect(
      mock.balanceOf(ethers.constants.AddressZero),
    ).rejects.toThrowError('Mock revert: YOU SHALL NOT PASS!');
  });

  it('reverts with function signature on missing mock', async () => {
    const signer = provider.getSigner(0);
    const mock = await Token.mock(signer);

    await expect(
      mock.balanceOf(ethers.constants.AddressZero),
    ).rejects.toThrowError('Mock not initialized: balanceOf(address)');
  });
});
