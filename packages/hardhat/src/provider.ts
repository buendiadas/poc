import type { HardhatRuntimeEnvironment } from 'hardhat/types';
import { BigNumber, providers, utils } from 'ethers';
import { History } from './history';
import { SignerWithAddress } from './signer';
import { FixtureCreator, Snapshots } from './snapshots';

export abstract class EthereumTestnetProvider extends providers.StaticJsonRpcProvider {
  public readonly snapshots = new Snapshots(this);
  public readonly history = new History();

  public abstract send(method: string, params: any): Promise<any>;

  public async snapshot<TFixture>(create: FixtureCreator<TFixture, this>): Promise<TFixture> {
    return this.snapshots.snapshot(create);
  }

  public async getSignerWithAddress(addressOrIndex: string | number) {
    return SignerWithAddress.create(await this.getSigner(addressOrIndex));
  }
}

export class HardhatProvider extends EthereumTestnetProvider {
  public readonly gas: undefined | BigNumber;
  public readonly gasPrice: undefined | BigNumber;

  constructor(public readonly env: HardhatRuntimeEnvironment) {
    super();

    if (this.env.network.config.gas !== 'auto') {
      this.gas = BigNumber.from(this.env.network.config.gas).mul(this.env.network.config.gasMultiplier);
    }

    if (this.env.network.config.gasPrice !== 'auto') {
      this.gasPrice = BigNumber.from(this.env.network.config.gasPrice);
    }
  }

  public send(method: string, params: any): Promise<any> {
    return this.env.network.provider.send(method, params);
  }

  public async estimateGas(transaction: utils.Deferrable<providers.TransactionRequest>): Promise<BigNumber> {
    return this.gas ?? super.estimateGas(transaction);
  }

  public async getGasPrice() {
    return this.gasPrice ?? super.getGasPrice();
  }
}
