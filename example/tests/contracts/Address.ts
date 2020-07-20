/* eslint-disable */
import { ethers } from 'ethers';
import { contract, Call, Send, Functions } from 'crestproject';

export type AddressConstructor = () => void;

export interface AddressFunctions extends Functions {
  // No external functions
}

export const Address = contract.fromSolidity<
  AddressFunctions,
  AddressConstructor
>(require('../../build/Address.json'));
