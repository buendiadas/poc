/* eslint-disable */
import { ethers } from 'ethers';
import { contract, Call, Send, Functions } from 'crestproject';

export type AmIRichAlreadyConstructor = (_tokenContract: string) => void;

export interface AmIRichAlreadyFunctions extends Functions {
  check: Call<() => boolean>;
  'check()': Call<() => boolean>;
}

export const AmIRichAlready = contract.fromSolidity<
  AmIRichAlreadyFunctions,
  AmIRichAlreadyConstructor
>(require('../../build/AmIRichAlready.json'));
