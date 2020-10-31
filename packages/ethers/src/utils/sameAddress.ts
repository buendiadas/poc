import { resolveAddress } from './resolveAddress';
import { AddressLike } from '../types';

export function sameAddress(a: AddressLike, b: AddressLike) {
  return resolveAddress(a) === resolveAddress(b);
}
