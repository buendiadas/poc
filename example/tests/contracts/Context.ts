/* eslint-disable */
import { ethers } from 'ethers';
import { contract, Call, Send, Functions } from 'crestproject';

export type ContextConstructor = () => void;

export interface ContextFunctions extends Functions {
  // No external functions
}

export const Context = contract.fromSolidity<
  ContextFunctions,
  ContextConstructor
>(require('../../build/Context.json'));
