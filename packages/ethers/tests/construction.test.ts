import { ethers } from 'ethers';
import { contract } from '../src/construction';
import { Call, Send } from '../src/types';
import { Contract } from '../src/contract';
import { SendFunction, CallFunction } from '../src/function';
import { randomAddress } from '../src/utils/randomAddress';
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

  const address = ethers.constants.AddressZero;
  const token = new Token(address, provider.getSigner(0));

  it('factory creates a contract instance', async () => {
    expect(token).toBeInstanceOf(Token);
  });

  it('shortcut directly invokes call for transactions', () => {
    expect(token.allowance(randomAddress(), randomAddress())).toBeInstanceOf(
      Promise
    );
  });

  it('shortcut directly invokes send for transactions', () => {
    expect(token.transfer(randomAddress(), 123)).toBeInstanceOf(Promise);
  });

  it('shortcut syntax allows chaining methods', () => {
    expect(token.transfer.args(randomAddress(), 123)).toBeInstanceOf(
      SendFunction
    );
  });

  it('shortcut syntax returns the first function fragment', () => {
    const actual = token.allowance.fragment.format();
    const expected = token['allowance(address,address)'].fragment.format();
    expect(actual).toEqual(expected);

    const not = token['allowance(address,uint)'].fragment.format();
    expect(actual).not.toEqual(not);
  });

  it('does not allow attaching a function instance to an imcompatible contract', () => {
    const IncompatibleContract = contract.fromSignatures`
      function other(address) view returns (string)
    `;

    const incompatible = new IncompatibleContract(undefined, provider);
    const allowance = token.allowance;
    expect(() => allowance.attach(incompatible as any)).toThrow(
      'Failed to attach function to incompatible contract'
    );
  });

  it('does allow attaching a function instance to a compatible contract', () => {
    const CompatibleContract = contract.fromSignatures`
      function allowance(address owner, address spender) view returns (uint256)
    `;

    const compatible = new CompatibleContract(undefined, provider);
    const allowance = token.allowance;
    expect(() => allowance.attach(compatible as any)).not.toThrow();
    expect(allowance.attach(compatible as any)).toBeInstanceOf(CallFunction);
  });
});
