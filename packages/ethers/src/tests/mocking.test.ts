import { ethers } from 'ethers';
import { network } from '@nomiclabs/buidler';
import { EthereumProvider } from '@nomiclabs/buidler/types';
import { contract } from '../construction';
import { Contract } from '../contract';
import { MockContract } from '../mock';
import { Functions, Call, Send } from '../types';

export class BuidlerProvider extends ethers.providers.JsonRpcProvider {
  constructor(public readonly provider: EthereumProvider) {
    super();
  }

  public send(method: string, params: any): Promise<any> {
    return this.provider.send(method, params);
  }
}

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
  const Token = contract.fromSignature<TokenFunctions>`
    function allowance(address owner, address spender) view returns (uint256)
    function allowance(address owner, uint how) view returns (uint256)
    function approve(address spender, uint256 amount) returns (bool)
    function balanceOf(address account) view returns (uint256)
    function decimals() view returns (uint8)
    function name() view returns (string)
    function symbol() view returns (string)
    function transfer(address recipient, uint256 amount) returns (bool)
  `;

  const provider = new BuidlerProvider(network.provider);

  it('properly deploys the mock contract', async () => {
    const signer = provider.getSigner(0);
    const mock = await Token.mock(signer);

    expect(mock).toBeInstanceOf(MockContract);
    expect(mock.contract).toBeInstanceOf(Contract);
    expect(mock.doppelganger).toBeInstanceOf(Contract);
  });

  it('can mock contract return values', async () => {
    const signer = provider.getSigner(0);
    const mock = await Token.mock(signer);

    await mock.balanceOf.returns(ethers.BigNumber.from('123'));
    const result = await mock.contract.balanceOf(ethers.constants.AddressZero);

    expect(result.toString()).toBe('123');
  });

  it('can mock contract return values with arguments', async () => {
    const signer = provider.getSigner(0);
    const mock = await Token.mock(signer);

    await mock.balanceOf(ethers.constants.AddressZero).returns('456');
    const result = await mock.contract.balanceOf(ethers.constants.AddressZero);

    expect(result.toString()).toBe('456');
  });

  it('can mock reverts', async () => {
    const signer = provider.getSigner(0);
    const mock = await Token.mock(signer);

    await mock.balanceOf(ethers.constants.AddressZero).reverts();
    await expect(
      mock.contract.balanceOf(ethers.constants.AddressZero),
    ).rejects.toThrowError('Mock revert');
  });
});
