import { ethers } from 'ethers';
import { Contract } from './contract';
import { propertyOf } from './utils';

// TODO: Properly limit the available options based on the function type and signature.

export interface ConstructorFragment extends ethers.utils.Fragment {
  stateMutability: string;
  payable: boolean;
  gas?: ethers.BigNumber;
  format(format?: string): string;
}

export interface FunctionOptions<TArgs extends any[] = []> {
  args?: TArgs;
  value?: ethers.BigNumberish;
  nonce?: ethers.BigNumberish;
  gas?: ethers.BigNumberish;
  price?: ethers.BigNumberish;
  block?: ethers.providers.BlockTag;
  from?: string;
  bytecode?: ethers.BytesLike;
}

export function isFunctionOptions<TArgs extends any[] = []>(
  value: any,
): value is FunctionOptions<TArgs> {
  if (typeof value === 'object' && !Array.isArray(value)) {
    if (ethers.BigNumber.isBigNumber(value)) {
      return false;
    }

    const keys = Object.keys(value);
    const allowed = [
      'args',
      'value',
      'nonce',
      'gas',
      'price',
      'block',
      'from',
      'bytecode',
    ];

    if (!keys.every((key) => allowed.includes(key))) {
      throw new Error('Invalid options');
    }

    return true;
  }

  return false;
}

export function resolveFunctionOptions<TArgs extends any[] = []>(
  ...args: [FunctionOptions<TArgs>] | TArgs
): FunctionOptions<TArgs> {
  const [first, ...rest] = args || [];
  if (rest.length === 0 && isFunctionOptions<TArgs>(first)) {
    return first;
  }

  return { args } as FunctionOptions<TArgs>;
}

export class ContractFunction<
  TArgs extends any[] = [],
  TContract extends Contract = Contract,
  TFragment extends ethers.utils.Fragment = ethers.utils.Fragment
> {
  public static create<
    TArgs extends any[] = [],
    TContract extends Contract = Contract,
    TFragment extends ethers.utils.Fragment = ethers.utils.Fragment
  >(
    contract: TContract,
    fragment: TFragment,
    ...args: TArgs
  ): ContractFunction<TArgs, TContract, TFragment>;

  public static create<
    TArgs extends any[] = [],
    TContract extends Contract = Contract,
    TFragment extends ethers.utils.Fragment = ethers.utils.Fragment
  >(
    contract: TContract,
    fragment: TFragment,
    options: FunctionOptions<TArgs>,
  ): ContractFunction<TArgs, TContract, TFragment>;

  public static create<
    TArgs extends any[] = [],
    TContract extends Contract = Contract,
    TFragment extends ethers.utils.Fragment = ethers.utils.Fragment
  >(
    contract: TContract,
    fragment: TFragment,
    ...args: [FunctionOptions<TArgs>] | TArgs
  ) {
    const options = resolveFunctionOptions(...args) as FunctionOptions<TArgs>;
    if (ethers.utils.FunctionFragment.isFunctionFragment(fragment)) {
      if (fragment.constant) {
        return new CallFunction<TArgs>(contract, fragment, options);
      }

      return new SendFunction<TArgs>(contract, fragment, options);
    }

    if (ethers.utils.FunctionFragment.isConstructorFragment(fragment)) {
      return new ConstructorFunction<TArgs>(contract, fragment, options);
    }

    throw new Error('Invalid fragment');
  }

  constructor(
    public readonly contract: TContract,
    public readonly fragment: TFragment,
    public readonly options: FunctionOptions<TArgs> = {},
  ) {}

  public args(...args: TArgs) {
    return this.refine({ args });
  }

  public value(value?: ethers.BigNumberish) {
    return this.refine({ value });
  }

  public bytecode(bytecode?: ethers.BytesLike) {
    return this.refine({ bytecode });
  }

  public nonce(nonce?: number) {
    return this.refine({ nonce });
  }

  public block(block?: ethers.providers.BlockTag) {
    return this.refine({ block });
  }

  public gas(limit?: ethers.BigNumberish, price?: ethers.BigNumberish) {
    return this.refine({ gas: limit, price });
  }

  public from(from?: string) {
    return this.refine({ from });
  }

  public refine(options: FunctionOptions<TArgs> = {}): this {
    const args = propertyOf('args', [options, this.options]);
    const value = propertyOf('value', [options, this.options]);
    const gas = propertyOf('gas', [options, this.options]);
    const price = propertyOf('price', [options, this.options]);
    const nonce = propertyOf('nonce', [options, this.options]);
    const block = propertyOf('block', [options, this.options]);
    const bytecode = propertyOf('bytecode', [options, this.options]);
    const from = propertyOf('from', [options, this.options]);

    return new (this.constructor as any)(this.contract, this.fragment, {
      args,
      value,
      gas,
      price,
      nonce,
      block,
      bytecode,
      from,
    });
  }
}

export class CallFunction<
  TArgs extends any[] = [],
  TReturn extends any = unknown,
  TContract extends Contract = Contract
> extends ContractFunction<TArgs, TContract, ethers.utils.FunctionFragment> {
  public async call(): Promise<TReturn> {
    const tx = await this.populate();
    if (this.contract.provider == null) {
      throw new Error('Missing provider');
    }

    const response = await this.contract.provider.call(tx);
    const result = this.contract.abi.decodeFunctionResult(
      this.fragment,
      response,
    );

    if (this.fragment.outputs?.length === 1) {
      return result[0];
    }

    return (result as any) as TReturn;
  }

  public attach(contract: Contract): this {
    const formatted = this.fragment.format();
    if (!contract.abi.functions.hasOwnProperty(formatted)) {
      throw new Error('Failed to attach function to incompatible contract');
    }

    return new (this.constructor as any)(contract, this.fragment, this.options);
  }

  protected async populate() {
    const data = this.contract.abi.encodeFunctionData(
      this.fragment,
      this.options.args,
    );

    const tx: ethers.PopulatedTransaction = {
      to: this.contract.address,
      data,
      ...(this.options.from && { from: this.options.from }),
      ...(this.options.nonce && {
        nonce: ethers.BigNumber.from(this.options.nonce).toNumber(),
      }),
      ...(this.options.value && {
        value: ethers.BigNumber.from(this.options.value),
      }),
      ...(this.options.price && {
        gasPrice: ethers.BigNumber.from(this.options.price),
      }),
      ...(this.options.gas && {
        gasLimit: ethers.BigNumber.from(this.options.gas),
      }),
    };

    return tx;
  }
}

export class SendFunction<
  TArgs extends any[] = [],
  TReturn extends any = void,
  TContract extends Contract = Contract
> extends CallFunction<TArgs, TReturn, TContract> {
  public async estimate(): Promise<ethers.BigNumber> {
    const tx = await this.populate();
    if (this.contract.provider == null) {
      throw new Error('Missing provider');
    }

    return this.contract.provider.estimateGas(tx);
  }

  public send(wait?: true): Promise<ethers.ContractReceipt>;
  public send(wait?: false): Promise<ethers.ContractTransaction>;
  public async send(
    wait: boolean = true,
  ): Promise<ethers.ContractReceipt | ethers.ContractTransaction> {
    if (!this.contract.signer) {
      throw new Error('Missing signer');
    }

    const tx = await this.populate();
    const response = await this.contract.signer.sendTransaction(tx);
    return wait ? response.wait() : response;
  }
}

export class ConstructorFunction<
  TArgs extends any[] = [],
  TContract extends Contract = Contract
> extends ContractFunction<TArgs, TContract, ConstructorFragment> {
  public async call(): Promise<void> {
    throw new Error('Call not implemented yet');
  }

  public async estimate(): Promise<ethers.BigNumber> {
    const tx = await this.populate();
    if (this.contract.provider == null) {
      throw new Error('Missing provider');
    }

    return this.contract.provider.estimateGas(tx);
  }

  public send(wait?: true): Promise<this['contract']>;
  public send(wait?: false): Promise<ethers.ContractTransaction>;
  public async send(
    wait: boolean = true,
  ): Promise<this['contract'] | ethers.ContractTransaction> {
    if (!this.contract.signer) {
      throw new Error('Missing signer');
    }

    const tx = await this.populate();
    const response = await this.contract.signer.sendTransaction(tx);

    if (!wait) {
      return response;
    }

    const receipt = await response.wait();
    return this.contract.attach(receipt.contractAddress);
  }

  protected async populate() {
    if (!this.options.bytecode) {
      throw new Error('Missing bytecode');
    }

    // Set the data to the bytecode + the encoded constructor arguments
    const data = ethers.utils.hexlify(
      ethers.utils.concat([
        this.options.bytecode,
        this.contract.abi.encodeDeploy(this.options.args),
      ]),
    );

    const tx: ethers.PopulatedTransaction = {
      data,
      ...(this.options.nonce && {
        nonce: ethers.BigNumber.from(this.options.nonce).toNumber(),
      }),
      ...(this.options.price && {
        gasPrice: ethers.BigNumber.from(this.options.price),
      }),
      ...(this.options.gas && {
        gasLimit: ethers.BigNumber.from(this.options.gas),
      }),
    };

    return tx;
  }
}