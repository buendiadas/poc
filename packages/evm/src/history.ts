import { ethers } from 'ethers';

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
    const map = new Map<string, string[]>();
    this.history.forEach((value, key) => {
      map.set(key, value.slice());
    });

    return new History(map);
  }

  public clear() {
    this.history.clear();
  }

  public reset(address: string) {
    const addr = ethers.utils.getAddress(address);
    return this.history.delete(addr);
  }

  public calls(address: string) {
    return this.history.get(address) ?? [];
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
