/* eslint-disable */
// @ts-nocheck
import { BytesLike, BigNumber, BigNumberish } from 'ethers';
import {
  contract,
  Call,
  Send,
  AddressLike,
  Contract,
} from '@crestproject/crestproject';

export type AmIRichAlreadyArgs = [_tokenContract: AddressLike];

// prettier-ignore
export interface AmIRichAlready extends Contract<AmIRichAlready> {
  // Shortcuts (using function name of first overload)
  check: Call<() => boolean, AmIRichAlready>

  // Explicit accessors (using full function signature)
  'check()': Call<() => boolean, AmIRichAlready>
}

let AmIRichAlreadyBytecode: string | undefined = undefined;
if (typeof window === 'undefined') {
  AmIRichAlreadyBytecode =
    '0x608060405234801561001057600080fd5b5060405161020d38038061020d8339818101604052602081101561003357600080fd5b8101908080519060200190929190505050806000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555050610179806100946000396000f3fe608060405234801561001057600080fd5b506004361061002b5760003560e01c8063919840ad14610030575b600080fd5b610038610052565b604051808215151515815260200191505060405180910390f35b6000806000809054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff166370a08231336040518263ffffffff1660e01b8152600401808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060206040518083038186803b1580156100f357600080fd5b505afa158015610107573d6000803e3d6000fd5b505050506040513d602081101561011d57600080fd5b8101908080519060200190929190505050905069d3c21bcecceda100000081119150509056fea2646970667358221220325b3aefab6fba58e6850f56682be5fe8ca975f4ba9145f2d2a39a6046d2011e64736f6c63430006080033';
}

// prettier-ignore
export const AmIRichAlready = contract<AmIRichAlready, AmIRichAlreadyArgs>(AmIRichAlreadyBytecode)`
  constructor(address _tokenContract)
  function check() view returns (bool)
`;
