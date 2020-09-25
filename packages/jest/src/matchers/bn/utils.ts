import { BigNumber, BigNumberish } from 'ethers';
import { forceFail } from '../utils';

export function printBigNumber(value: BigNumberish) {
  const bn = BigNumber.from(value);
  return `${bn.toString()} (${bn.toHexString()})`;
}

export type MatcherCallback = (
  received: BigNumber,
  expected: BigNumber
) => jest.CustomMatcherResult;

export function ensureBigNumbers(
  context: jest.MatcherContext,
  received: any,
  expected: any,
  callback: MatcherCallback
) {
  let receivedBn: BigNumber;
  let expectedBn: BigNumber;

  try {
    receivedBn = BigNumber.from(received);
  } catch {
    return forceFail(context, received, 'The received value is not numberish');
  }

  try {
    expectedBn = BigNumber.from(expected);
  } catch {
    return forceFail(context, expected, 'The expected value is not numberish');
  }

  return callback(receivedBn, expectedBn);
}
