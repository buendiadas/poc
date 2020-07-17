import { ethers } from 'ethers';
import { contract } from '../construction';
import { Functions, Call, Send } from '../types';
import { Contract } from '../contract';
import { SendFunction, CallFunction } from '../function';

describe('contract tagged template literals', () => {
  // prettier-ignore
  interface TokenFunctions extends Functions {
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
  const Token = contract()<TokenFunctions>`
    function allowance(address owner, address spender) view returns (uint256)
    function allowance(address owner, uint how) view returns (uint256)
    function approve(address spender, uint256 amount) returns (bool)
    function balanceOf(address account) view returns (uint256)
    function decimals() view returns (uint8)
    function name() view returns (string)
    function symbol() view returns (string)
    function transfer(address recipient, uint256 amount) returns (bool)
  `;

  const provider = new ethers.providers.JsonRpcProvider();
  const token = new Token('0x', provider);

  it('factory creates a contract instance', () => {
    expect(token).toBeInstanceOf(Contract);
  });

  it('shortcut directly invokes call for transactions', () => {
    expect(token.allowance('0x', '0x')).toBeInstanceOf(Promise);
  });

  it('shortcut directly invokes send for transactions', () => {
    expect(token.transfer('0x', 123)).toBeInstanceOf(Promise);
  });

  it('shortcut syntax allows chaining methods', () => {
    expect(token.transfer.args('0x', 123)).toBeInstanceOf(SendFunction);
  });

  it('shortcut syntax returns the first function fragment', () => {
    const actual = token.allowance.fragment.format();
    const expected = token['allowance(address,address)'].fragment.format();
    expect(actual).toEqual(expected);

    const not = token['allowance(address,uint)'].fragment.format();
    expect(actual).not.toEqual(not);
  });

  it('does not allow attaching a function instance to an imcompatible contract', () => {
    const IncompatibleContract = contract()`
      function other(address) view returns (string)
    `;

    const incompatible = new IncompatibleContract('0x', provider);
    const allowance = token.allowance;
    expect(() => allowance.attach(incompatible)).toThrow(
      'Failed to attach function to incompatible contract',
    );
  });

  it('does allow attaching a function instance to a compatible contract', () => {
    const CompatibleContract = contract()`
      function allowance(address owner, address spender) view returns (uint256)
    `;

    const compatible = new CompatibleContract('0x', provider);
    const allowance = token.allowance;
    expect(() => allowance.attach(compatible)).not.toThrow();
    expect(allowance.attach(compatible)).toBeInstanceOf(CallFunction);
  });
});
