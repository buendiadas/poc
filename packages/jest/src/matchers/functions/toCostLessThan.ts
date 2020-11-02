import { providers } from 'ethers';
import { isTransactionReceipt } from '../../utils';
import { toBeLteBigNumber } from '../bn';

export function toCostLessThan(this: jest.MatcherContext, received: any, expected: any) {
  if (!isTransactionReceipt(received)) {
    throw new Error('The received value is not a transaction receipt');
  }

  const receipt = received as providers.TransactionReceipt;
  return toBeLteBigNumber.call(this as any, receipt.gasUsed, expected);
}
