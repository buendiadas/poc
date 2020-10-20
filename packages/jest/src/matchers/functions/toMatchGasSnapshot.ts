import { providers } from 'ethers';
import { toMatchInlineSnapshot } from 'jest-snapshot';
import { isTransactionReceipt } from '../../utils';

export function toMatchGasSnapshot(
  this: jest.MatcherContext,
  received: any,
  expected: any
) {
  if (!isTransactionReceipt(received)) {
    throw new Error('The received value is not a transaction receipt');
  }

  const receipt = received as providers.TransactionReceipt;
  return toMatchInlineSnapshot.call(this as any, receipt.gasUsed, expected);
}
