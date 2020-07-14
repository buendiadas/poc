import { ethers } from 'ethers';
import { propertyOf } from './utils';
import { AnyContract } from './types';

export interface FunctionPayload<TArgs extends any[] = unknown[]> {
  args?: TArgs;
  value?: ethers.BigNumberish;
  data?: string;
  nonce?: ethers.BigNumberish;
  gas?: ethers.BigNumberish;
  price?: ethers.BigNumberish;
  block?: ethers.providers.BlockTag;
}

export function isFunctionPayload(value: any): value is FunctionPayload {
  if (typeof value === 'object' && !Array.isArray(value)) {
    return true;
  }

  return false;
}

export function resolveFunctionPayload(...args: any): FunctionPayload {
  const [first, ...rest] = args || [];
  if (rest.length === 0 && isFunctionPayload(first)) {
    return first;
  }

  return { args };
}

export class ContractFunction<TArgs extends any[] = unknown[], TReturn = any> {
  public static create<TArgs extends any[] = unknown[]>(
    contract: AnyContract,
    fragment: ethers.utils.FunctionFragment,
    ...args: [...TArgs]
  ): ContractFunction;
  public static create<TArgs extends any[] = unknown[]>(
    contract: AnyContract,
    fragment: ethers.utils.FunctionFragment,
    payload: FunctionPayload<TArgs>,
  ): ContractFunction;
  public static create<TArgs extends any[] = unknown[]>(
    contract: AnyContract,
    fragment: ethers.utils.FunctionFragment,
    ...args: any
  ) {
    const payload = resolveFunctionPayload(...args) as FunctionPayload<TArgs>;
    if (fragment.constant) {
      return new ContractFunction<TArgs>(contract, fragment, payload);
    }

    return new SendFunction<TArgs>(contract, fragment, payload);
  }

  constructor(
    public readonly contract: AnyContract,
    public readonly fragment: ethers.utils.FunctionFragment,
    public readonly payload: FunctionPayload<TArgs> = {},
  ) {}

  public async call(): Promise<TReturn> {
    // TODO: Actually call the function.
    return {} as TReturn;
  }

  public args(...args: TArgs) {
    return this.refine({ args });
  }

  public refine(payload: FunctionPayload<TArgs> = {}): this {
    const args = propertyOf('args', [payload, this.payload]);
    const value = propertyOf('value', [payload, this.payload]);
    const data = propertyOf('data', [payload, this.payload]);
    const gas = propertyOf('gas', [payload, this.payload]);
    const price = propertyOf('price', [payload, this.payload]);
    const nonce = propertyOf('nonce', [payload, this.payload]);
    const block = propertyOf('block', [payload, this.payload]);

    return new (this.constructor as any)(this.contract, this.fragment, {
      args,
      value,
      data,
      gas,
      price,
      nonce,
      block,
    });
  }

  public attach(contract: AnyContract): this {
    const formatted = this.fragment.format();
    if (!contract.abi.functions.hasOwnProperty(formatted)) {
      throw new Error('Failed to attach function to incompatible contract');
    }

    return new (this.constructor as any)(contract, this.fragment, this.payload);
  }
}

export class SendFunction<
  TArgs extends any[] = unknown[],
  TReturn extends any = void
> extends ContractFunction<TArgs, TReturn> {
  public value(value?: ethers.BigNumberish) {
    return this.refine({ value });
  }

  public nonce(nonce?: number) {
    return this.refine({ nonce });
  }

  public gas(limit?: ethers.BigNumberish, price?: ethers.BigNumberish) {
    return this.refine({ gas: limit, price });
  }

  public async estimate(): Promise<ethers.BigNumber> {
    // TODO: Actually call estimate.
    return ethers.BigNumber.from(10);
  }

  public send(wait?: false): Promise<ethers.ContractReceipt>;
  public send(wait?: true): Promise<ethers.ContractTransaction>;
  public async send(
    wait: boolean = false,
  ): Promise<ethers.ContractReceipt | ethers.ContractTransaction> {
    if (this.fragment.constant) {
      throw new Error(`This is a view and thus can't be sent`);
    }

    if (!this.contract.signer) {
      throw new Error('Missing required signer for sending');
    }

    // TODO: Actually create the tx and send it.
    return {} as ethers.ContractTransaction;
  }
}
