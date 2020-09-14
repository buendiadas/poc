import { ethers } from 'ethers';
import { Call, Send } from '../src/types';
import { contract } from '../src/construction';
import { randomAddress } from '../src/utils/randomAddress';
import { Contract } from '../src/contract';
import { provider } from './provider';
import { ERC20 } from './contracts/ERC20';

describe('contract tagged template literals', () => {
  // prettier-ignore
  interface Token extends Contract<Token> {
    'allowance': Call<(owner: string, spender: string) => ethers.BigNumber, Token>;
    'allowance(address,address)': Call<(owner: string, spender: string) => ethers.BigNumber, Token>;
    'allowance(address,uint)': Call<(owner: string, how: ethers.BigNumberish) => ethers.BigNumber, Token>;
    'approve': Send<(spender: string, amount: ethers.BigNumberish) => boolean, Token>;
    'approve(address,uint)': Send<(spender: string, amount: ethers.BigNumberish) => boolean, Token>;
    'balanceOf': Call<(account: string) => ethers.BigNumber, Token>;
    'balanceOf(address)': Call<(account: string) => ethers.BigNumber, Token>;
    'decimals': Call<() => ethers.BigNumber, Token>;
    'decimals()': Call<() => ethers.BigNumber, Token>;
    'name': Call<() => string, Token>;
    'name()': Call<() => string, Token>;
    'symbol': Call<() => string, Token>;
    'symbol()': Call<() => string, Token>;
    'transfer': Send<(to: string, amount: ethers.BigNumberish) => void, Token>;
    'transfer(address,uint256)': Send<(to: string, amount: ethers.BigNumberish) => void, Token>;
  }

  // prettier-ignore
  const Token = contract.fromSignatures<Token>`
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
      mock.balanceOf(ethers.constants.AddressZero)
    ).rejects.toThrowError('Mock revert: YOU SHALL NOT PASS!');
  });

  it('reverts with function signature on missing mock', async () => {
    const signer = provider.getSigner(0);
    const mock = await Token.mock(signer);

    await expect(
      mock.balanceOf(ethers.constants.AddressZero)
    ).rejects.toThrowError('Mock not initialized: balanceOf(address)');
  });

  it('can forward calls', async () => {
    const signer = provider.getSigner(0);
    const token = await ERC20.deploy(signer, 'Test Token', 'TEST');
    const mock = await ERC20.mock(signer);

    await expect(mock.forward(token.name)).resolves.toBe('Test Token');
  });

  it('can forward sends', async () => {
    const signer = provider.getSigner(0);
    const token = await ERC20.deploy(signer, 'Test Token', 'TEST');
    const mock = await ERC20.mock(signer);

    const spender = randomAddress();
    const amount = ethers.utils.parseEther('1');
    await expect(
      mock.forward(token.approve, spender, amount)
    ).resolves.toMatchObject({
      transactionHash: expect.anything(),
      transactionIndex: expect.anything(),
    });
  });

  it('can reset previously set mocks', async () => {
    const signer = provider.getSigner(0);
    const token = await Token.mock(signer);

    let result;

    await token.balanceOf.returns(123);
    result = await token.balanceOf(ethers.constants.AddressZero);
    expect(result.toString()).toBe('123');

    await token.balanceOf.reset();
    result = token.balanceOf(ethers.constants.AddressZero);
    await expect(result).rejects.toThrowError(
      'Mock not initialized: balanceOf(address)'
    );
  });

  it('can reset previously set mocks with specific args', async () => {
    const signer = provider.getSigner(0);
    const token = await Token.mock(signer);

    let result;

    await token.balanceOf.returns(123);
    result = await token.balanceOf(ethers.constants.AddressZero);
    expect(result.toString()).toBe('123');

    await token.balanceOf.given(ethers.constants.AddressZero).returns(456);
    result = await token.balanceOf(ethers.constants.AddressZero);
    expect(result.toString()).toBe('456');

    await token.balanceOf.given(ethers.constants.AddressZero).reset();
    result = await token.balanceOf(ethers.constants.AddressZero);
    expect(result.toString()).toBe('123');

    await token.balanceOf.reset();
    result = token.balanceOf(ethers.constants.AddressZero);
    await expect(result).rejects.toThrowError(
      'Mock not initialized: balanceOf(address)'
    );
  });
});
