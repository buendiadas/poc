import { providers } from 'ethers';
import { History } from './history';
import { SignerWithAddress } from './signer';
import { FixtureCreator, Snapshots } from './snapshots';

export abstract class EthereumTestnetProvider extends providers.StaticJsonRpcProvider {
  public readonly snapshots = new Snapshots(this);
  public readonly history = new History();

  public abstract send(method: string, params: any): Promise<any>;

  public async snapshot<TFixture>(
    create: FixtureCreator<TFixture, this>,
  ): Promise<TFixture> {
    return this.snapshots.snapshot(create);
  }

  public async getSignerWithAddress(addressOrIndex: string | number) {
    return SignerWithAddress.create(await this.getSigner(addressOrIndex));
  }
}
