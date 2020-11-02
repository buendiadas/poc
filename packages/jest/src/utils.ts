import { providers } from 'ethers';

export function forceFail(error: string | (() => string), invert: boolean) {
  const pass = invert ? true : false;
  const message = typeof error === 'function' ? error : () => error;
  return { pass, message };
}

export function isTransactionReceipt(value: any): value is providers.TransactionReceipt {
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
