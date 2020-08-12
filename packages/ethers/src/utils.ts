import { ethers, Signer } from 'ethers';
import { Interface, Fragment, JsonFragment } from '@ethersproject/abi';
import { Contract } from './contract';

export type AddressLike = Contract | Signer | string;

export async function resolveAddress(value: AddressLike): Promise<string> {
  if (value instanceof Contract) {
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

export function randomAddress() {
  const address = ethers.utils.hexlify(ethers.utils.randomBytes(20));
  return ethers.utils.getAddress(address);
}

export type PossibleInterface = string | (Fragment | JsonFragment | string)[];
export function ensureInterface(abi: Interface | PossibleInterface) {
  if (Interface.isInterface(abi)) {
    return abi;
  }

  return new Interface(abi);
}
