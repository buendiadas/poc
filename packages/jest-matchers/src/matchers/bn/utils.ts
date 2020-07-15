import { ethers } from 'ethers';

export function printBigNumber(value: ethers.BigNumberish) {
  const bn = ethers.BigNumber.from(value);
  return `${bn.toString()} (${bn.toHexString()})`;
}
