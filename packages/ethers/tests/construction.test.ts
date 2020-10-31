import { BigNumber, BigNumberish, constants, utils } from 'ethers';
import { BasicToken } from '@crestproject/artifactory';
import {
  randomAddress,
  contract,
  Contract,
  Call,
  Send,
  SendFunction,
  CallFunction,
} from '@crestproject/ethers';

// prettier-ignore
interface Token extends Contract<Token> {
  'allowance': Call<(owner: string, spender: string) => BigNumber, Token>;
  'allowance(address,address)': Call<(owner: string, spender: string) => BigNumber, Token>;
  'allowance(address,uint)': Call<(owner: string, how: BigNumberish) => BigNumber, Token>;
  'approve': Send<(spender: string, amount: BigNumberish) => boolean, Token>;
  'approve(address,uint)': Send<(spender: string, amount: BigNumberish) => boolean, Token>;
  'balanceOf': Call<(account: string) => BigNumber, Token>;
  'balanceOf(address)': Call<(account: string) => BigNumber, Token>;
  'decimals': Call<() => BigNumber, Token>;
  'decimals()': Call<() => BigNumber, Token>;
  'name': Call<() => string, Token>;
  'name()': Call<() => string, Token>;
  'symbol': Call<() => string, Token>;
  'symbol()': Call<() => string, Token>;
  'transfer': Send<(to: string, amount: BigNumberish) => void, Token>;
  'transfer(address,uint256)': Send<(to: string, amount: BigNumberish) => void, Token>;
}

// prettier-ignore
const Token = contract<Token>()`
  function allowance(address owner, address spender) view returns (uint256)
  function allowance(address owner, uint how) view returns (uint256)
  function approve(address spender, uint256 amount) returns (bool)
  function balanceOf(address account) view returns (uint256)
  function decimals() view returns (uint8)
  function name() view returns (string)
  function symbol() view returns (string)
  function transfer(address recipient, uint256 amount) returns (bool)
`;

describe('construction', () => {
  it('factory creates a contract instance', async () => {
    const signer = await provider.getSignerWithAddress(0);
    const token = new Token(constants.AddressZero, signer);
    expect(token).toBeInstanceOf(Token);
  });

  it('shortcut directly invokes call for transactions', async () => {
    const signer = await provider.getSignerWithAddress(0);
    const token = new Token(constants.AddressZero, signer);
    const call = token.allowance(randomAddress(), randomAddress());
    expect(call).toBeInstanceOf(Promise);
    await expect(call).rejects.toThrowError();
  });

  it('shortcut directly invokes send for transactions', async () => {
    const signer = await provider.getSignerWithAddress(0);
    const token = new Token(constants.AddressZero, signer);
    const call = token.transfer(randomAddress(), 123);
    expect(call).toBeInstanceOf(Promise);
    await expect(call).resolves.toMatchObject({});
  });

  it('shortcut syntax allows chaining methods', async () => {
    const signer = await provider.getSignerWithAddress(0);
    const token = new Token(constants.AddressZero, signer);
    expect(token.transfer.args(randomAddress(), 123)).toBeInstanceOf(
      SendFunction,
    );
  });

  it('shortcut syntax returns the first function fragment', async () => {
    const signer = await provider.getSignerWithAddress(0);
    const token = new Token(constants.AddressZero, signer);
    const actual = token.allowance.fragment.format();
    const expected = token['allowance(address,address)'].fragment.format();
    expect(actual).toEqual(expected);

    const not = token['allowance(address,uint)'].fragment.format();
    expect(actual).not.toEqual(not);
  });

  it('does not allow attaching a function instance to an imcompatible contract', async () => {
    const signer = await provider.getSignerWithAddress(0);
    const token = new Token(constants.AddressZero, signer);
    const IncompatibleContract = contract()`
      function other(address) view returns (string)
    `;

    const incompatible = new IncompatibleContract(randomAddress(), provider);
    const allowance = token.allowance;
    expect(() => allowance.attach(incompatible as any)).toThrow(
      'Failed to attach function to incompatible contract',
    );
  });

  it('does allow attaching a function instance to a compatible contract', async () => {
    const signer = await provider.getSignerWithAddress(0);
    const token = new Token(constants.AddressZero, signer);
    const CompatibleContract = contract()`
      function allowance(address owner, address spender) view returns (uint256)
    `;

    const compatible = new CompatibleContract(randomAddress(), provider);
    const allowance = token.allowance;
    expect(() => allowance.attach(compatible as any)).not.toThrow();
    expect(allowance.attach(compatible as any)).toBeInstanceOf(CallFunction);
  });

  it('can access receipt of deployment', async () => {
    const signer = await provider.getSignerWithAddress(0);
    const token = BasicToken.deploy(signer, utils.parseEther('100'));

    await expect(
      token.then((contract: BasicToken) => contract.deployment),
    ).resolves.toMatchObject({
      contractAddress: expect.stringMatching(/^0x/),
    });
  });
});
