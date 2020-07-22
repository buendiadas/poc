import { ethers } from 'ethers';
import {
  CallFunction,
  ConstructorFunction,
  ContractFunction,
  SendFunction,
} from './function';

// TODO: Add types and proxies for event handling.

export class Contract {
  private readonly _signer?: ethers.Signer = undefined;
  private readonly _provider?: ethers.providers.Provider = undefined;

  public get signer() {
    return this._signer;
  }

  public get provider() {
    return this._provider ?? this.signer?.provider;
  }

  constructor(
    public readonly abi: ethers.utils.Interface,
    public readonly address: string = '0x',
    provider?: ethers.providers.Provider | ethers.Signer,
  ) {
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
    }, {} as { [name: string]: ethers.utils.FunctionFragment });

    const functions = new Proxy(this, {
      get: (target, prop: string) => {
        if (prop === 'then' || prop === 'catch' || prop === 'finally') {
          if (!names[prop]) {
            return;
          }
        }

        const fragment = names[prop] ?? target.abi.getFunction(prop);
        const ctor = (...args: any) => {
          return ContractFunction.create(target, fragment, ...args);
        };

        return new Proxy(ctor, {
          // Obtain a refinable function instance (e.g. token.function.transfer.nonce(10).args('0x', 123).send())
          get: (target, prop, receiver) => {
            return Reflect.get(target(), prop, receiver);
          },
          // Shortcut for directly using call/send (e.g. token.function.transfer('0x', 123))
          apply: (target, thiz, args) => {
            const fn = target.apply(thiz, args);

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

    return new Proxy(this, {
      get: (target, prop: string, receiver) => {
        if (Reflect.has(target, prop)) {
          return Reflect.get(target, prop, receiver);
        }

        // Shortcut so users can directly call a function (e.g. token.transfer('0x', 123))
        return (functions as any)[prop];
      },
    });
  }

  public event(signature: string) {
    return this.abi.getEvent(signature);
  }

  public attach(address: string): Contract {
    const provider = this.signer ?? this.provider;
    return new Contract(this.abi, address, provider);
  }

  public connect(
    provider: ethers.Signer | ethers.providers.Provider,
  ): Contract {
    return new Contract(this.abi, this.address, provider);
  }
}
