import { ethers } from 'ethers';
import { contract } from '../construction';
import { Functions } from '../types';
import { Contract } from '../contract';
import { SendFunction, CallFunction, ConstructorFunction } from '../function';

describe('contract tagged template literals', () => {
  // prettier-ignore
  interface TokenFunctions extends Functions {
    'constructor': ConstructorFunction;
    'constructor()': ConstructorFunction;
    // 'allowance': CallFunction<[owner: string, spender: string], ethers.BigNumber>;
    'allowance': CallFunction<[string, string], ethers.BigNumber>;
    // 'allowance(address,address)': CallFunction<[owner: string, spender: string], ethers.BigNumber>;
    'allowance(address,address)': CallFunction<[string, string], ethers.BigNumber>;
    // 'allowance(address,uint)': CallFunction<[owner: string, how: number], ethers.BigNumber>;
    'allowance(address,uint)': CallFunction<[string, number], ethers.BigNumber>;
    // 'approve(address,uint)': SendFunction<[spender: string, amount: number], boolean>;
    'approve(address,uint)': SendFunction<[string, number], boolean>;
    'decimals': CallFunction<never, ethers.BigNumber>;
    'decimals()': CallFunction<never, ethers.BigNumber>;
    'name': CallFunction<never, string>;
    'name()': CallFunction<never, string>;
    'symbol': CallFunction<never, string>;
    'symbol()': CallFunction<never, string>;
    // 'transfer': SendFunction<[to: string, amount: number]>;
    'transfer': SendFunction<[string, number]>;
    // 'transfer(address,uint256)': SendFunction<[to: string, amount: number]>;
    'transfer(address,uint256)': SendFunction<[string, number]>;
  }

  const Token = contract()<TokenFunctions>`
    function allowance(address owner, address spender) view returns (uint256)
    function allowance(address owner, uint how) view returns (uint256)
    function approve(address spender, uint256 amount) returns (bool)
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

  it('does allow attaching a function instance to a compatible contract', async () => {
    const CompatibleContract = contract()`
      function allowance(address owner, address spender) view returns (uint256)
    `;

    const compatible = new CompatibleContract('0x', provider);
    const allowance = token.allowance;
    expect(() => allowance.attach(compatible)).not.toThrow();
    expect(allowance.attach(compatible)).toBeInstanceOf(CallFunction);
  });
});
