import { utils } from 'ethers';
import { Contract } from '@crestproject/ethers';

export interface EvmMessage {
  to: Buffer;
  data: Buffer;
}

export class History {
  private history = new Map<string, string[]>();

  public constructor(seed?: Map<string, string[]>) {
    if (seed != null) {
      this.history = new Map(seed);
    }
  }

  public clone() {
    return new History(this.history);
  }

  public override(history: History) {
    this.history = new Map(history.history);
  }

  public clear() {
    this.history.clear();
  }

  public reset(contract: Contract | string) {
    const address = (contract as any)?.address
      ? (contract as any).address
      : contract;

    const checksum = utils.getAddress(address);
    return this.history.delete(checksum);
  }

  public calls(contract: Contract | string) {
    const address = (contract as any)?.address
      ? (contract as any).address
      : contract;

    const checksum = utils.getAddress(address);
    return this.history.get(checksum) ?? [];
  }

  public record(message: EvmMessage) {
    const to = message.to ? utils.hexlify(message.to) : '0x';
    if (to === '0x') {
      return;
    }

    const checksum = utils.getAddress(to);
    const data = message.data ? utils.hexlify(message.data) : '0x';
    this.history.set(checksum, this.calls(checksum).concat(data));
  }
}
