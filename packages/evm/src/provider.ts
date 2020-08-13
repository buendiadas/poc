import { BigNumber, BigNumberish, providers, utils } from 'ethers';
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

export class BuidlerProvider extends providers.StaticJsonRpcProvider {
  public readonly gas: BigNumber;
  public readonly snapshots = new Map<FixtureCreator<any>, Snapshot<any>>();
  public history: History;

  constructor(
    public readonly provider: EthereumProvider,
    gas: BigNumberish = 9500000,
  ) {
    super();

    // Avoid calls to eth_estimateGas if a static gas limit is set.
    this.gas = BigNumber.from(gas);

    // Re-route call history recording to whatever is the currently
    // active history object. Required for making history and snapshoting
    // work nicely together.
    this.history = new History();
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

  public async estimateGas(
    transaction: utils.Deferrable<providers.TransactionRequest>,
  ): Promise<BigNumber> {
    if (this.gas && !this.gas.isZero()) {
      return this.gas;
    }

    return super.estimateGas(transaction);
  }
}
