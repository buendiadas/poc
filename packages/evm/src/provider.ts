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
  public history: History;
  public readonly snapshots = new Map<FixtureCreator<any>, Snapshot<any>>();

  constructor(public readonly provider: EthereumProvider) {
    super();

    // Re-route call history recording to whatever is the currently
    // active history object. Required for making history and snapshoting
    // work nicely together.
    addListener(provider, 'beforeMessage', (message: Message) => {
      this.history.record(message);
    });

    this.history = new History();
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
      const history = this.history.clone();
      snapshot = { id: '', history, data: await creator(this) };
    }

    snapshot.id = await this.provider.send('evm_snapshot', []);
    this.snapshots.set(creator, snapshot);
    this.history = snapshot.history;

    return snapshot.data;
  }
}