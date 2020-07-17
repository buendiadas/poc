import { ethers } from 'ethers';

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
    return forceFail(context, received, 'received');
  }

  try {
    expectedBn = ethers.BigNumber.from(expected);
  } catch {
    return forceFail(context, expected, 'expected');
  }

  return callback(receivedBn, expectedBn);
}

function forceFail(context: jest.MatcherContext, value: any, name: string) {
  const pass = context.isNot ? true : false;
  const message = () =>
    `The ${name} value is not numberish:\n\n` +
    `  ${context.utils.printReceived(value)}`;

  return { pass, message };
}
