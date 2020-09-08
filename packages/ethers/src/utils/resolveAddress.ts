import { Signer, utils } from 'ethers';
import { Contract } from '../contract';
import { AddressLike, AddressLikeSync } from '../types';

export async function resolveAddress(value: AddressLike): Promise<string> {
  if (value instanceof Contract) {
    return resolveAddress(value.address);
  }

  if (Signer.isSigner(value)) {
    return resolveAddress(await value.getAddress());
  }

  return utils.getAddress(value);
}

export function resolveAddressSync(value: AddressLikeSync): string {
  if (value instanceof Contract) {
    return resolveAddressSync(value.address);
  }

  return utils.getAddress(value);
}
