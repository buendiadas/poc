import { ethers } from 'ethers';
import * as miscMatchers from './matchers/misc';
import * as bnMatchers from './matchers/bn';

expect.extend({
  ...bnMatchers,
  ...miscMatchers,
});

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeProperAddress(): CustomMatcherResult;
      toBeProperPrivateKey(): CustomMatcherResult;
      toBeProperHex(length: number): CustomMatcherResult;
      toBeGtBigNumber(expected: ethers.BigNumberish): CustomMatcherResult;
      toBeLtBigNumber(expected: ethers.BigNumberish): CustomMatcherResult;
      toBeGteBigNumber(expected: ethers.BigNumberish): CustomMatcherResult;
      toBeLteBigNumber(expected: ethers.BigNumberish): CustomMatcherResult;
      toEqBigNumber(expected: ethers.BigNumberish): CustomMatcherResult;
    }
  }
}
