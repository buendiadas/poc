import { ethers } from 'ethers';

describe('misc', () => {
  it('toBeProperAddress', async () => {
    const address = ethers.utils.hexlify(ethers.utils.randomBytes(20));
    expect(address).toBeProperAddress();
    expect('0x').not.toBeProperAddress();
  });
});
