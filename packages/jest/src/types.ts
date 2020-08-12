import { BigNumberish, utils } from 'ethers';
import { BuidlerProvider } from '@crestproject/evm';

export type EthereumMatchers<R> = {
  toBeProperAddress(): R;
  toBeProperPrivateKey(): R;
  toBeProperHex(length: number): R;
  toBeGtBigNumber(expected: BigNumberish): R;
  toBeLtBigNumber(expected: BigNumberish): R;
  toBeGteBigNumber(expected: BigNumberish): R;
  toBeLteBigNumber(expected: BigNumberish): R;
  toEqBigNumber(expected: BigNumberish): R;
  toBeReverted(): R;
  toBeRevertedWith(message: string): R;
  toBeReceipt(): R;
  toHaveEmitted(name: string | utils.EventFragment): R;
  toHaveBeenCalledOnContract(): R;
  toHaveBeenCalledOnContractWith<TArgs extends any[] = []>(
    ...args: TArgs
  ): Promise<R>;
};

declare global {
  namespace globalThis {
    var provider: BuidlerProvider;
  }

  namespace jest {
    interface Matchers<R> extends EthereumMatchers<R> {}
  }
}
