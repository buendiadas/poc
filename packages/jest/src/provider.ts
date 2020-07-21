import { ethers } from 'ethers';
import { EthereumProvider } from '@nomiclabs/buidler/types';

export type FixtureCreator<TFixture> = (
  provider: BuidlerProvider,
) => Promise<TFixture>;

export interface Snapshot<TFixture> {
  data: TFixture;
  id: string;
}

export class BuidlerProvider extends ethers.providers.JsonRpcProvider {
  public readonly snapshots = new Map<FixtureCreator<any>, Snapshot<any>>();

  constructor(public readonly provider: EthereumProvider) {
    super();
  }

  public send(method: string, params: any): Promise<any> {
    return this.provider.send(method, params);
  }

  public async snapshot<T>(
    creator: FixtureCreator<T> = () => Promise.resolve(null as any),
  ): Promise<T> {
    let snapshot: Snapshot<T>;

    if (this.snapshots.has(creator)) {
      snapshot = this.snapshots.get(creator)!;
      await this.provider.send('evm_revert', [snapshot.id]);
    } else {
      snapshot = { id: '', data: await creator(this) };
    }

    snapshot.id = await this.provider.send('evm_snapshot', []);
    this.snapshots.set(creator, snapshot);

    return snapshot.data;
  }
}
