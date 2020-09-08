import { ethers, Signer } from 'ethers';
import {
  Interface,
  Fragment,
  JsonFragment,
  EventFragment,
} from '@ethersproject/abi';
import { Contract } from './contract';
import { ContractReceipt, SendFunction } from './function';

export type AddressLike = Contract | Signer | string;
export type AddressLikeSync = Contract | string;

export function resolveAddressSync(value: AddressLikeSync): string {
  if (value instanceof Contract) {
    return resolveAddressSync(value.address);
  }

  return ethers.utils.getAddress(value);
}

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

export type PossibleEvent = string | Fragment | JsonFragment;
export function ensureEvent(event: string | PossibleEvent, abi?: Interface) {
  if (EventFragment.isEventFragment(event)) {
    return event;
  }

  if (typeof event === 'string') {
    if (event.indexOf('(') !== -1) {
      return EventFragment.from(event);
    }

    const fragment = abi?.getEvent(event);
    if (fragment != null) {
      return fragment;
    }
  }

  throw new Error('Failed to resolve event');
}

// TODO: Add proper return type based on the event fragment's underlying type.
export function extractEvent<TFunction extends SendFunction<any, any>>(
  receipt: ContractReceipt<TFunction>,
  event: string | EventFragment,
) {
  const contract = receipt.function.contract.abi;
  const fragment = ensureEvent(event, contract);
  const abi = new Interface([fragment]);
  const topic = abi.getEventTopic(fragment);
  const matches = (receipt.logs ?? [])
    .filter((item) => item.topics.includes(topic))
    .map((log) => abi.parseLog(log));

  return matches;
}
