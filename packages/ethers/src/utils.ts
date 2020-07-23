import { ethers, Signer } from 'ethers';
import { Contract } from './contract';
import { MockContract } from './mock';

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

export type AddressLike = Contract | MockContract | Signer | string;

export async function resolveAddress(value: AddressLike): Promise<string> {
  if (value instanceof Contract || value instanceof MockContract) {
    return resolveAddress(value.address);
  }

  if (ethers.Signer.isSigner(value)) {
    return resolveAddress(await value.getAddress());
  }

  return ethers.utils.getAddress(value);
}

export function resolveArguments(
  params: ethers.utils.ParamType | ethers.utils.ParamType[],
  value: any,
): Promise<any> {
  if (Array.isArray(params)) {
    return Promise.all(
      params.map((type, index) => {
        const inner = Array.isArray(value) ? value[index] : value[type.name];
        return resolveArguments(type, inner);
      }),
    );
  }

  if (params.type === 'address') {
    return resolveAddress(value);
  }

  if (params.type === 'tuple') {
    return resolveArguments(params.components, value);
  }

  if (params.baseType === 'array') {
    if (!Array.isArray(value)) {
      throw new Error('Invalid array value');
    }

    return Promise.all(
      value.map((inner) => {
        return resolveArguments(params.arrayChildren, inner);
      }),
    );
  }

  return value;
}
