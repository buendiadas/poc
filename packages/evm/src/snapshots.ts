import { EthereumTestnetProvider } from './provider';
import { History } from './history';

export type FixtureCreator<
  TFixture,
  TProvider extends EthereumTestnetProvider = any
> = (provider: TProvider) => Promise<TFixture>;

export interface Snapshot<TFixture> {
  data: TFixture;
  history: History;
  id: string;
}

export class Snapshots<
  TProvider extends EthereumTestnetProvider = EthereumTestnetProvider
> {
  private readonly snapshots = new Map<
    FixtureCreator<any, TProvider>,
    Snapshot<any>
  >();

  constructor(private readonly provider: TProvider) {}

  public async snapshot<TFixture>(
    create: FixtureCreator<TFixture, TProvider>
  ): Promise<TFixture> {
    const revert = this.snapshots.get(create);
    const snapshot = revert
      ? await this.revert<TFixture>(revert)
      : await this.record<TFixture>(create);

    this.snapshots.set(create, snapshot);

    if (revert) {
      this.provider.history.override(snapshot.history);
    }

    return snapshot.data;
  }

  private async record<TFixture>(
    create: FixtureCreator<TFixture, TProvider>
  ): Promise<Snapshot<TFixture>> {
    const data = await create(this.provider);
    const id = await this.provider.send('evm_snapshot', []);
    const history = this.provider.history.clone();
    return { id, data, history };
  }

  private async revert<TFixture>(
    snapshot: Snapshot<TFixture>
  ): Promise<Snapshot<TFixture>> {
    await this.provider.send('evm_revert', [snapshot.id]);
    const id = await this.provider.send('evm_snapshot', []);
    return { ...snapshot, id };
  }
}
