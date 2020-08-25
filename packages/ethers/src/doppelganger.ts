import { ethers } from 'ethers';
import { Contract, deploy } from './contract';
import { ContractReceipt, SendFunction, CallFunction } from './function';
import { Send } from './types';
import { AddressLike, resolveArguments } from './utils';

export const DoppelgangerCompilerOutput = {
  abi: [
    {
      "inputs": [
        {
          "internalType": "bytes4[]",
          "name": "_sighashes",
          "type": "bytes4[]"
        },
        {
          "internalType": "string[]",
          "name": "_signatures",
          "type": "string[]"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "stateMutability": "payable",
      "type": "fallback"
    },
    {
      "inputs": [
        {
          "internalType": "bytes",
          "name": "_data",
          "type": "bytes"
        },
        {
          "internalType": "address",
          "name": "_callee",
          "type": "address"
        }
      ],
      "name": "__doppelganger__mockForward",
      "outputs": [
        {
          "internalType": "bytes",
          "name": "",
          "type": "bytes"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes",
          "name": "_data",
          "type": "bytes"
        }
      ],
      "name": "__doppelganger__mockReset",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes",
          "name": "_data",
          "type": "bytes"
        },
        {
          "internalType": "bytes",
          "name": "_value",
          "type": "bytes"
        }
      ],
      "name": "__doppelganger__mockReturns",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes",
          "name": "_data",
          "type": "bytes"
        },
        {
          "internalType": "string",
          "name": "_reason",
          "type": "string"
        }
      ],
      "name": "__doppelganger__mockReverts",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ],
  bytecode:
    '60806040523480156200001157600080fd5b50604051620018a3380380620018a38339818101604052810190620000379190620003a4565b80518251146200007e576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401620000759062000459565b60405180910390fd5b60008090505b82518110156200016f576040518060400160405280600115158152602001838381518110620000af57fe5b602002602001015181525060016000858481518110620000cb57fe5b60200260200101517bffffffffffffffffffffffffffffffffffffffffffffffffffffffff19167bffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916815260200190815260200160002060008201518160000160006101000a81548160ff02191690831515021790555060208201518160010190805190602001906200015d92919062000178565b50905050808060010191505062000084565b505050620005b5565b828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f10620001bb57805160ff1916838001178555620001ec565b82800160010185558215620001ec579182015b82811115620001eb578251825591602001919060010190620001ce565b5b509050620001fb9190620001ff565b5090565b6200022491905b808211156200022057600081600090555060010162000206565b5090565b90565b600082601f8301126200023957600080fd5b8151620002506200024a82620004a9565b6200047b565b915081818352602084019350602081019050838560208402820111156200027657600080fd5b60005b83811015620002aa57816200028f888262000331565b84526020840193506020830192505060018101905062000279565b5050505092915050565b600082601f830112620002c657600080fd5b8151620002dd620002d782620004d2565b6200047b565b9150818183526020840193506020810190508360005b838110156200032757815186016200030c888262000348565b845260208401935060208301925050600181019050620002f3565b5050505092915050565b60008151905062000342816200059b565b92915050565b600082601f8301126200035a57600080fd5b8151620003716200036b82620004fb565b6200047b565b915080825260208301602083018583830111156200038e57600080fd5b6200039b83828462000565565b50505092915050565b60008060408385031215620003b857600080fd5b600083015167ffffffffffffffff811115620003d357600080fd5b620003e18582860162000227565b925050602083015167ffffffffffffffff811115620003ff57600080fd5b6200040d85828601620002b4565b9150509250929050565b600062000426601a8362000528565b91507f5369676e617475726573206c656e677468206d69736d617463680000000000006000830152602082019050919050565b60006020820190508181036000830152620004748162000417565b9050919050565b6000604051905081810181811067ffffffffffffffff821117156200049f57600080fd5b8060405250919050565b600067ffffffffffffffff821115620004c157600080fd5b602082029050602081019050919050565b600067ffffffffffffffff821115620004ea57600080fd5b602082029050602081019050919050565b600067ffffffffffffffff8211156200051357600080fd5b601f19601f8301169050602081019050919050565b600082825260208201905092915050565b60007fffffffff0000000000000000000000000000000000000000000000000000000082169050919050565b60005b838110156200058557808201518184015260208101905062000568565b8381111562000595576000848401525b50505050565b620005a68162000539565b8114620005b257600080fd5b50565b6112de80620005c56000396000f3fe6080604052600436106100435760003560e01c80630ad4c242146100d75780634de8e4aa146101005780638863f50a146101295780638a85047f1461015257610044565b5b61004c610ae0565b61005461018f565b9050600115158160400151151514156100c757806060015160405160200161007c9190611102565b6040516020818303038152906040526040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016100be9190611146565b60405180910390fd5b6100d48160200151610750565b50005b3480156100e357600080fd5b506100fe60048036038101906100f99190610e23565b610758565b005b34801561010c57600080fd5b5061012760048036038101906101229190610d86565b61087e565b005b34801561013557600080fd5b50610150600480360381019061014b9190610e98565b6108f6565b005b34801561015e57600080fd5b5061017960048036038101906101749190610dcb565b610a1c565b6040516101869190611124565b60405180910390f35b610197610ae0565b60008080366040516101aa9291906110c7565b604051809103902081526020019081526020016000206040518060800160405290816000820160009054906101000a900460ff16151515158152602001600182018054600181600116156101000203166002900480601f01602080910402602001604051908101604052809291908181526020018280546001816001161561010002031660029004801561027f5780601f106102545761010080835404028352916020019161027f565b820191906000526020600020905b81548152906001019060200180831161026257829003601f168201915b505050505081526020016002820160009054906101000a900460ff16151515158152602001600382018054600181600116156101000203166002900480601f01602080910402602001604051908101604052809291908181526020018280546001816001161561010002031660029004801561033c5780601f106103115761010080835404028352916020019161033c565b820191906000526020600020905b81548152906001019060200180831161031f57829003601f168201915b5050505050815250509050600115158160000151151514156103605780905061074d565b60008080357fffffffff000000000000000000000000000000000000000000000000000000001660405160200161039791906110ac565b6040516020818303038152906040528051906020012081526020019081526020016000206040518060800160405290816000820160009054906101000a900460ff16151515158152602001600182018054600181600116156101000203166002900480601f01602080910402602001604051908101604052809291908181526020018280546001816001161561010002031660029004801561047a5780601f1061044f5761010080835404028352916020019161047a565b820191906000526020600020905b81548152906001019060200180831161045d57829003601f168201915b505050505081526020016002820160009054906101000a900460ff16151515158152602001600382018054600181600116156101000203166002900480601f0160208091040260200160405190810160405280929190818152602001828054600181600116156101000203166002900480156105375780601f1061050c57610100808354040283529160200191610537565b820191906000526020600020905b81548152906001019060200180831161051a57829003601f168201915b50505050508152505090506001151581600001511515141561055b5780905061074d565b610563610b0c565b6001600080357fffffffff00000000000000000000000000000000000000000000000000000000167bffffffffffffffffffffffffffffffffffffffffffffffffffffffff19167bffffffffffffffffffffffffffffffffffffffffffffffffffffffff191681526020019081526020016000206040518060400160405290816000820160009054906101000a900460ff16151515158152602001600182018054600181600116156101000203166002900480601f0160208091040260200160405190810160405280929190818152602001828054600181600116156101000203166002900480156106965780601f1061066b57610100808354040283529160200191610696565b820191906000526020600020905b81548152906001019060200180831161067957829003601f168201915b5050505050815250509050600115158160000151151514156107125780602001516040516020016106c791906110e0565b6040516020818303038152906040526040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016107099190611146565b60405180910390fd5b6040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161074490611168565b60405180910390fd5b90565b805160208201f35b604051806080016040528060011515815260200183838080601f016020809104026020016040519081016040528093929190818152602001838380828437600081840152601f19601f8201169050808301925050505050505081526020016000151581526020016040518060200160405280600081525081525060008086866040516107e59291906110c7565b6040518091039020815260200190815260200160002060008201518160000160006101000a81548160ff0219169083151502179055506020820151816001019080519060200190610837929190610b28565b5060408201518160020160006101000a81548160ff0219169083151502179055506060820151816003019080519060200190610874929190610ba8565b5090505050505050565b60008083836040516108919291906110c7565b60405180910390208152602001908152602001600020600080820160006101000a81549060ff02191690556001820160006108cc9190610c28565b6002820160006101000a81549060ff02191690556003820160006108f09190610c70565b50505050565b604051806080016040528060011515815260200160405180602001604052806000815250815260200160011515815260200183838080601f016020809104026020016040519081016040528093929190818152602001838380828437600081840152601f19601f8201169050808301925050505050505081525060008086866040516109839291906110c7565b6040518091039020815260200190815260200160002060008201518160000160006101000a81548160ff02191690831515021790555060208201518160010190805190602001906109d5929190610b28565b5060408201518160020160006101000a81548160ff0219169083151502179055506060820151816003019080519060200190610a12929190610ba8565b5090505050505050565b6060600060608373ffffffffffffffffffffffffffffffffffffffff168686604051610a499291906110c7565b6000604051808303816000865af19150503d8060008114610a86576040519150601f19603f3d011682016040523d82523d6000602084013e610a8b565b606091505b5091509150818190610ad3576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610aca9190611146565b60405180910390fd5b5080925050509392505050565b604051806080016040528060001515815260200160608152602001600015158152602001606081525090565b6040518060400160405280600015158152602001606081525090565b828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f10610b6957805160ff1916838001178555610b97565b82800160010185558215610b97579182015b82811115610b96578251825591602001919060010190610b7b565b5b509050610ba49190610cb8565b5090565b828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f10610be957805160ff1916838001178555610c17565b82800160010185558215610c17579182015b82811115610c16578251825591602001919060010190610bfb565b5b509050610c249190610cb8565b5090565b50805460018160011615610100020316600290046000825580601f10610c4e5750610c6d565b601f016020900490600052602060002090810190610c6c9190610cb8565b5b50565b50805460018160011615610100020316600290046000825580601f10610c965750610cb5565b601f016020900490600052602060002090810190610cb49190610cb8565b5b50565b610cda91905b80821115610cd6576000816000905550600101610cbe565b5090565b90565b600081359050610cec81611291565b92915050565b60008083601f840112610d0457600080fd5b8235905067ffffffffffffffff811115610d1d57600080fd5b602083019150836001820283011115610d3557600080fd5b9250929050565b60008083601f840112610d4e57600080fd5b8235905067ffffffffffffffff811115610d6757600080fd5b602083019150836001820283011115610d7f57600080fd5b9250929050565b60008060208385031215610d9957600080fd5b600083013567ffffffffffffffff811115610db357600080fd5b610dbf85828601610cf2565b92509250509250929050565b600080600060408486031215610de057600080fd5b600084013567ffffffffffffffff811115610dfa57600080fd5b610e0686828701610cf2565b93509350506020610e1986828701610cdd565b9150509250925092565b60008060008060408587031215610e3957600080fd5b600085013567ffffffffffffffff811115610e5357600080fd5b610e5f87828801610cf2565b9450945050602085013567ffffffffffffffff811115610e7e57600080fd5b610e8a87828801610cf2565b925092505092959194509250565b60008060008060408587031215610eae57600080fd5b600085013567ffffffffffffffff811115610ec857600080fd5b610ed487828801610cf2565b9450945050602085013567ffffffffffffffff811115610ef357600080fd5b610eff87828801610d3c565b925092505092959194509250565b610f1e610f19826111e8565b611276565b82525050565b6000610f3083856111af565b9350610f3d838584611234565b82840190509392505050565b6000610f5482611188565b610f5e818561119e565b9350610f6e818560208601611243565b610f7781611280565b840191505092915050565b6000610f8d82611193565b610f9781856111ba565b9350610fa7818560208601611243565b610fb081611280565b840191505092915050565b6000610fc682611193565b610fd081856111cb565b9350610fe0818560208601611243565b80840191505092915050565b6000610ff96016836111cb565b91507f4d6f636b206e6f7420696e697469616c697a65643a20000000000000000000006000830152601682019050919050565b60006110396014836111ba565b91507f4d6f636b206e6f7420696e697469616c697a65640000000000000000000000006000830152602082019050919050565b6000611079600d836111cb565b91507f4d6f636b207265766572743a20000000000000000000000000000000000000006000830152600d82019050919050565b60006110b88284610f0d565b60048201915081905092915050565b60006110d4828486610f24565b91508190509392505050565b60006110eb82610fec565b91506110f78284610fbb565b915081905092915050565b600061110d8261106c565b91506111198284610fbb565b915081905092915050565b6000602082019050818103600083015261113e8184610f49565b905092915050565b600060208201905081810360008301526111608184610f82565b905092915050565b600060208201905081810360008301526111818161102c565b9050919050565b600081519050919050565b600081519050919050565b600082825260208201905092915050565b600081905092915050565b600082825260208201905092915050565b600081905092915050565b60006111e182611214565b9050919050565b60007fffffffff0000000000000000000000000000000000000000000000000000000082169050919050565b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b82818337600083830152505050565b60005b83811015611261578082015181840152602081019050611246565b83811115611270576000848401525b50505050565b6000819050919050565b6000601f19601f8301169050919050565b61129a816111d6565b81146112a557600080fd5b5056fea26469706673582212204ac09faa1a1d38bcdcf828133c19367684c6e5cfb99c24f8a211ba6f5319e2e864736f6c63430006080033',
};

export type DoppelgangerArgs = [_sighashes: ethers.utils.BytesLike[], _signatures: string[]];

// prettier-ignore
export interface Doppelganger extends Contract<Doppelganger> {
  // Shortcut functions.
  __doppelganger__mockForward: Send<(data: ethers.utils.BytesLike, callee: AddressLike) => ethers.utils.Bytes, Doppelganger>;
  __doppelganger__mockReturns: Send<(data: ethers.utils.BytesLike, value: ethers.utils.BytesLike) => void, Doppelganger>;
  __doppelganger__mockReverts: Send<(data: ethers.utils.BytesLike, reason: string) => void, Doppelganger>;
  __doppelganger__mockReset: Send<(data: ethers.utils.BytesLike) => void, Doppelganger>;
  
  // Full function signature.
  '__doppelganger__mockForward(bytes,address)': Send<(data: ethers.utils.BytesLike, callee: AddressLike) => ethers.utils.Bytes, Doppelganger>;
  '__doppelganger__mockReturns(bytes,bytes)': Send<(data: ethers.utils.BytesLike, value: ethers.utils.BytesLike) => void, Doppelganger>;
  '__doppelganger__mockReverts(bytes,string)': Send<(data: ethers.utils.BytesLike, reason: string) => void, Doppelganger>;
  '__doppelganger__mockReset(bytes)': Send<(data: ethers.utils.BytesLike) => void, Doppelganger>;
}

const bytecode = DoppelgangerCompilerOutput.bytecode;
const abi = DoppelgangerCompilerOutput.abi;

export class Doppelganger extends Contract<Doppelganger> {
  public static async deploy(signer: ethers.Signer, ...args: DoppelgangerArgs): Promise<Doppelganger> {
    const address = ethers.constants.AddressZero;
    const contract = new Doppelganger(abi, address, signer);
    const receipt = await deploy(contract, bytecode ?? '0x', ...args);
    return contract.attach(receipt.contractAddress);
  }
}
