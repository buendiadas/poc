import { ethers } from 'ethers';
import { forceFail } from '../utils';

export function printBigNumber(value: ethers.BigNumberish) {
  const bn = ethers.BigNumber.from(value);
  return `${bn.toString()} (${bn.toHexString()})`;
}

export type MatcherCallback = (
  received: ethers.BigNumber,
  expected: ethers.BigNumber,
) => jest.CustomMatcherResult;

export function ensureBigNumbers(
  context: jest.MatcherContext,
  received: any,
  expected: any,
  callback: MatcherCallback,
) {
  let receivedBn: ethers.BigNumber;
  let expectedBn: ethers.BigNumber;

  try {
    receivedBn = ethers.BigNumber.from(received);
  } catch {
    return forceFail(context, received, 'The received value is not numberish');
  }

  try {
    expectedBn = ethers.BigNumber.from(expected);
  } catch {
    return forceFail(context, expected, 'The expected value is not numberish');
  }

  return callback(receivedBn, expectedBn);
}
