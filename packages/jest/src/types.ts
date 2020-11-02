import { BigNumberish, utils } from 'ethers';
import { EthereumTestnetProvider } from '@crestproject/evm';
import { AddressLike } from '@crestproject/ethers';

export type EthereumMatchers<R> = {
  toBeProperAddress(): R;
  toBeProperPrivateKey(): R;
  toBeProperHex(length: number): R;
  toMatchAddress(expected: AddressLike): R;
  toMatchParams(types: utils.ParamType | utils.ParamType[], expected: any): R;
  toMatchFunctionInput(fragment: string | utils.FunctionFragment, expected: any): R;
  toMatchFunctionOutput(fragment: string | utils.FunctionFragment, expected: any): R;
  toMatchEventArgs(expected: any): R;
  toBeGtBigNumber(expected: BigNumberish): R;
  toBeLtBigNumber(expected: BigNumberish): R;
  toBeGteBigNumber(expected: BigNumberish): R;
  toBeLteBigNumber(expected: BigNumberish): R;
  toEqBigNumber(expected: BigNumberish): R;
  toBeReverted(): R;
  toBeRevertedWith(message: string): R;
  toBeReceipt(): R;
  toCostLessThan(expected: BigNumberish): R;
  toMatchGasSnapshot(expected?: BigNumberish): R;
  toHaveEmitted(event: string | utils.EventFragment): R;
  toHaveEmittedWith(event: string | utils.EventFragment, expected: any): R;
  toHaveBeenCalledOnContract(): R;
  toHaveBeenCalledOnContractWith<TArgs extends any[] = []>(...args: TArgs): Promise<R>;
};

declare global {
  namespace globalThis {
    var provider: EthereumTestnetProvider;
  }

  namespace jest {
    interface Matchers<R> extends EthereumMatchers<R> {}
  }
}
