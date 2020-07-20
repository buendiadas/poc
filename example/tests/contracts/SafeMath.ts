/* eslint-disable */
import { ethers } from 'ethers';
import { contract, Call, Send, Functions } from 'crestproject';

export type SafeMathConstructor = () => void;

export interface SafeMathFunctions extends Functions {
  // No external functions
}

export const SafeMath = contract.fromSolidity<
  SafeMathFunctions,
  SafeMathConstructor
>(require('../../build/SafeMath.json'));
