import {
  Interface,
  Fragment,
  FunctionFragment,
  JsonFragment,
} from '@ethersproject/abi';
import { ethers } from 'ethers';
import {
  CallFunction,
  ConstructorFunction,
  ContractFunction,
  resolveFunctionOptions,
  SendFunction,
} from './function';

export type PossibleInterface = string | (Fragment | JsonFragment | string)[];

function ensureInterface(abi: Interface | PossibleInterface) {
  if (Interface.isInterface(abi)) {
    return abi;
  }

  return new Interface(abi);
}

export function deploy<TContract extends Contract = Contract>(
  contract: TContract,
  bytecode: string,
  ...args: any
) {
  const options = resolveFunctionOptions(...args);
  const constructor = contract.abi.deploy;
  const fn = new ConstructorFunction(contract, constructor, options);
  const hex = ethers.utils.hexlify(bytecode ?? '', {
    allowMissingPrefix: true,
  });

  return fn.bytecode(hex).send();
}

// TODO: Add types and proxies for event handling.
export class Contract<TContract extends Contract = any> {
  public readonly abi: Interface;

  private readonly _signer?: ethers.Signer = undefined;
  public get signer() {
    return this._signer;
  }

  private readonly _provider?: ethers.providers.Provider = undefined;
  public get provider() {
    return this._provider ?? this.signer?.provider;
  }

  constructor(
    abi: Interface | PossibleInterface,
    public readonly address: string,
    provider?: ethers.providers.Provider | ethers.Signer,
  ) {
    this.abi = ensureInterface(abi);
    if (ethers.Signer.isSigner(provider)) {
      this._signer = provider;
    } else if (ethers.providers.Provider.isProvider(provider)) {
      this._provider = provider;
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
        if (!names[prop] && !prop.includes('(')) {
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
          apply: (_, __, args) => {
            const fn = instance.args.apply(instance, args);
            if (fn instanceof ConstructorFunction) {
              return fn.send();
            }

            if (fn instanceof SendFunction) {
              return fn.send();
            }

            if (fn instanceof CallFunction) {
              return fn.call();
            }
          },
        });
      },
    });
  }

  public attach(address: string): TContract {
    const provider = this.signer ?? this.provider;
    return new Contract(this.abi, address, provider) as any;
  }

  public connect(
    provider: ethers.Signer | ethers.providers.Provider,
  ): TContract {
    return new Contract(this.abi, this.address, provider) as any;
  }
}
