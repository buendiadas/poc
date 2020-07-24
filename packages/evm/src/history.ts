import { ethers } from 'ethers';
import { Contract } from '@crestproject/ethers';

export interface Message {
  to: Buffer;
  data: Buffer;
}

export class History {
  private readonly history = new Map<string, string[]>();

  public constructor(seed?: Map<string, string[]>) {
    if (seed != null) {
      this.history = new Map(seed);
    }
  }

  public clone() {
    return new History(this.history);
  }

  public clear() {
    this.history.clear();
  }

  public reset(contract: Contract | string) {
    const address = (contract as any)?.address
      ? (contract as any).address
      : contract;
    const checksum = ethers.utils.getAddress(address);
    return this.history.delete(checksum);
  }

  public calls(contract: Contract | string) {
    const address = (contract as any)?.address
      ? (contract as any).address
      : contract;
    const checksum = ethers.utils.getAddress(address);
    return this.history.get(checksum) ?? [];
  }

  public record(message: Message) {
    if (!message.to) {
      return;
    }

    const to = ethers.utils.getAddress(ethers.utils.hexlify(message.to));
    const data = message.data ? ethers.utils.hexlify(message.data) : '0x';

    this.history.set(to, this.calls(to).concat(data));
  }
}
