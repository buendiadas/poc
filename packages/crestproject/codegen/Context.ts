/* eslint-disable */
import { ethers } from 'ethers';
import {
  contract,
  Call,
  Send,
  Functions,
} from '@crestproject/ethers-contracts';

export type ContextConstructor = () => void;

export interface ContextFunctions extends Functions {
  // No external functions
}

export const Context = contract.fromSolidity<
  ContextFunctions,
  ContextConstructor
>(require('../../packages/crestproject/codegen'));
