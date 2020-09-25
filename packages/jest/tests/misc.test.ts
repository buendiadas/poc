import { utils } from 'ethers';

describe('misc', () => {
  it('toBeProperAddress', async () => {
    const address = utils.hexlify(utils.randomBytes(20));
    expect(address).toBeProperAddress();
    expect('0x').not.toBeProperAddress();
  });
});
