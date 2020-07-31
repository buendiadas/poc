import { ethers } from 'ethers';
import { EthereumProvider } from '@nomiclabs/buidler/types';
import { History, Message } from './history';
import { addListener } from './vm';

export type FixtureCreator<TFixture> = (
  provider: BuidlerProvider,
) => Promise<TFixture>;

export interface Snapshot<TFixture> {
  data: TFixture;
  history: History;
  id: string;
}

export class BuidlerProvider extends ethers.providers.JsonRpcProvider {
  public readonly snapshots = new Map<FixtureCreator<any>, Snapshot<any>>();

  constructor(
    public readonly provider: EthereumProvider,
    public history: History = new History(),
  ) {
    super();

    // Re-route call history recording to whatever is the currently
    // active history object. Required for making history and snapshoting
    // work nicely together.
    addListener(provider, 'beforeMessage', (message: Message) => {
      this.history.record(message);
    });
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
      const data = await creator(this);
      snapshot = { id: '', history: this.history, data };
    }

    snapshot.id = await this.provider.send('evm_snapshot', []);

    this.history = snapshot.history.clone();
    this.snapshots.set(creator, snapshot);

    return snapshot.data;
  }
}
