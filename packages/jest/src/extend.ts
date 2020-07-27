import { ethers } from 'ethers';
import * as matchers from './matchers';

expect.extend(matchers);

export type EthereumMatchers<R> = {
  toBeProperAddress(): R;
  toBeProperPrivateKey(): R;
  toBeProperHex(length: number): R;
  toBeGtBigNumber(expected: ethers.BigNumberish): R;
  toBeLtBigNumber(expected: ethers.BigNumberish): R;
  toBeGteBigNumber(expected: ethers.BigNumberish): R;
  toBeLteBigNumber(expected: ethers.BigNumberish): R;
  toEqBigNumber(expected: ethers.BigNumberish): R;
  toBeReverted(): R;
  toBeRevertedWith(message: string): R;
  toBeReceipt(): R;
  toHaveEmitted(name: string): R;
  toHaveBeenCalledOnContract(): R;
  toHaveBeenCalledOnContractTimes(count: number): R;
  toHaveBeenCalledOnContractWith<TArgs extends any[] = []>(
    ...args: TArgs
  ): Promise<R>;
};

declare global {
  namespace jest {
    interface Matchers<R> extends EthereumMatchers<R> {}
  }
}
