import { Interface, FunctionFragment } from '@ethersproject/abi';
import { providers, utils, Signer } from 'ethers';
import {
  CallFunction,
  ConstructorFunction,
  ContractFunction,
  ContractReceipt,
  resolveFunctionOptions,
  SendFunction,
} from './function';
import { AddressLike } from './types';
import { ensureInterface, PossibleInterface } from './utils/ensureInterface';
import { resolveAddress } from './utils/resolveAddress';

export function deploy<
  TContract extends Contract = Contract,
  TArgs extends any[] = any
>(
  contract: TContract,
  bytecode: string,
  ...args: TArgs
): Promise<ContractReceipt<ConstructorFunction<TArgs, TContract>>> {
  const options = resolveFunctionOptions(...args);
  const constructor = contract.abi.deploy;
  const fn = new ConstructorFunction<TArgs, TContract>(
    contract,
    constructor,
    options
  );

  const hex = utils.hexlify(bytecode ?? '', {
    allowMissingPrefix: true,
  });

  return fn.bytecode(hex).send();
}

// TODO: Add types and proxies for event handling.
export class Contract<TContract extends Contract = any> {
  public readonly address: string;
  public readonly abi: Interface;
  public deployment?: ContractReceipt<ConstructorFunction<any, TContract>>;

  // @ts-ignore
  private readonly __TYPE__?: string = 'CONTRACT';
  public static isContract(contract: any): contract is Contract {
    return contract?.__TYPE__ === 'CONTRACT';
  }

  private readonly _signer?: Signer = undefined;
  public get signer() {
    return this._signer;
  }

  private readonly _provider?: providers.Provider = undefined;
  public get provider() {
    return (this._provider ?? this.signer?.provider)!;
  }

  constructor(
    abi: Interface | PossibleInterface,
    address: AddressLike,
    provider: providers.Provider | Signer
  ) {
    this.address = resolveAddress(address);
    this.abi = ensureInterface(abi);
    if (Signer.isSigner(provider)) {
      this._signer = provider;
    } else if (providers.Provider.isProvider(provider)) {
      this._provider = provider;
    } else {
      throw new Error('Missing provider');
    }

    const names = Object.values(this.abi.functions).reduce((carry, current) => {
      if (!carry[current.name]) {
        carry[current.name] = current;
      }

      return carry;
    }, {} as { [name: string]: FunctionFragment });

    return new Proxy(this, {
      get: (target, prop: string, receiver) => {
        if (Reflect.has(target, prop)) {
          return Reflect.get(target, prop, receiver);
        }

        // Do not attempt to call `getFunction` for non-signatures.
        if (!names[prop] && !prop?.includes?.('(')) {
          return;
        }

        if (typeof prop !== 'string') {
          return;
        }

        const fragment = names[prop] ?? target.abi.getFunction(prop);
        const instance = ContractFunction.create(target, fragment);
        return new Proxy(() => {}, {
          has: (_, prop) => {
            return Reflect.has(instance, prop);
          },
          get: (_, prop, receiver) => {
            return Reflect.get(instance, prop, receiver);
          },
          set: (_, prop, receiver) => {
            return Reflect.set(instance, prop, receiver);
          },
          apply: (_, __, args) => {
            const fn = instance.args.apply(instance, args);
            if (ConstructorFunction.isConstructorFunction(fn)) {
              return fn.send();
            }

            if (SendFunction.isSendFunction(fn)) {
              return fn.send();
            }

            if (CallFunction.isCallFunction(fn)) {
              return fn.call();
            }

            throw new Error('Invalid function call');
          },
        });
      },
    });
  }

  public clone(
    address: AddressLike,
    provider: Signer | providers.Provider
  ): TContract {
    return new Contract(this.abi, address, provider) as any;
  }

  public attach(address: AddressLike) {
    const provider = this.signer ?? this.provider;
    return this.clone(address, provider);
  }

  public connect(provider: Signer | providers.Provider) {
    return this.clone(this.address, provider);
  }
}
