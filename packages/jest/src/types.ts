import { ethers } from 'ethers';

declare global {
  namespace globalThis {
    var provider: ethers.providers.JsonRpcProvider;
  }
}
