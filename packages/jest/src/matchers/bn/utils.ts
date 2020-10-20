import { BigNumber, BigNumberish } from 'ethers';
import { forceFail } from '../../utils';

export function printBigNumber(value: BigNumberish) {
  const bn = BigNumber.from(value);
  return `${bn.toString()} (${bn.toHexString()})`;
}

export type MatcherCallback = (
  received: BigNumber,
  expected: BigNumber
) => jest.CustomMatcherResult;

export function ensureBigNumbers(
  received: any,
  expected: any,
  invert: boolean,
  callback: MatcherCallback
) {
  let receivedBn: BigNumber;
  let expectedBn: BigNumber;

  try {
    receivedBn = BigNumber.from(received);
  } catch {
    return forceFail(received, 'The received value is not numberish', invert);
  }

  try {
    expectedBn = BigNumber.from(expected);
  } catch {
    return forceFail(expected, 'The expected value is not numberish', invert);
  }

  return callback(receivedBn, expectedBn);
}
