import { Signer, utils, Wallet } from 'ethers';
import { Contract } from '../contract';
import { AddressLike, AddressLikeAsync } from '../types';

export function resolveAddress(value: AddressLike): string {
  if (typeof value === 'string') {
    return utils.getAddress(value);
  }

  if (Contract.isContract(value)) {
    return resolveAddress(value.address);
  }

  if (Signer.isSigner(value) && (value as Wallet).address) {
    return resolveAddress((value as Wallet).address);
  }

  throw new Error('Failed to resolve address');
}

export async function resolveAddressAsync(
  value: AddressLikeAsync
): Promise<string> {
  if (typeof value === 'string') {
    return utils.getAddress(value);
  }

  if (Contract.isContract(value)) {
    return resolveAddressAsync(value.address);
  }

  if (Signer.isSigner(value)) {
    return resolveAddressAsync(await value.getAddress());
  }

  throw new Error('Failed to resolve address');
}
