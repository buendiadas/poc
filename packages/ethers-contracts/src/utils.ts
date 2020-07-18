import { ethers } from 'ethers';

export function propertyOf<TOr = any>(
  property: string,
  candidates: object[] = [],
): TOr {
  const obj = candidates.find((obj) => obj.hasOwnProperty(property));
  return (obj as any)?.[property] ?? undefined;
}

export function ensureInterface(
  fragments: string | (ethers.utils.Fragment | string)[],
) {
  if (ethers.utils.Interface.isInterface(fragments)) {
    return fragments;
  }

  return new ethers.utils.Interface(fragments);
}
