import { providers } from 'ethers';
import { printReceived } from 'jest-matcher-utils';

export function forceFail(value: any, error: string, invert: boolean) {
  const pass = invert ? true : false;
  const message = () => `${error}:\n\n  ${printReceived(value)}`;

  return { pass, message };
}

export function isTransactionReceipt(
  value: any
): value is providers.TransactionReceipt {
  try {
    expect(value).toMatchObject({
      to: expect.any(String),
      from: expect.any(String),
      transactionIndex: expect.any(Number),
      gasUsed: expect.any(Object),
      logsBloom: expect.any(String),
      blockHash: expect.any(String),
      transactionHash: expect.any(String),
      blockNumber: expect.any(Number),
      confirmations: expect.any(Number),
      cumulativeGasUsed: expect.any(Object),
    });
  } catch (e) {
    return false;
  }

  return true;
}
