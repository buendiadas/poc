import {
  Fragment,
  ConstructorFragment,
  FunctionFragment,
} from '@ethersproject/abi';
import {
  BigNumber,
  BigNumberish,
  BytesLike,
  ethers,
  PopulatedTransaction,
  ContractReceipt as EthersContractReceipt,
  ContractTransaction as EthersContractTransaction,
  providers,
  Signer,
  utils,
} from 'ethers';
import { Contract } from './contract';
import { AddressLike } from './types';
import { resolveAddress } from './utils/resolveAddress';
import { resolveArguments } from './utils/resolveArguments';

export interface ContractReceipt<
  TFunction extends
    | SendFunction<any, any>
    | ConstructorFunction<any> = SendFunction
> extends EthersContractReceipt {
  function: TFunction;
}

export interface ContractTransaction<
  TFunction extends
    | SendFunction<any, any>
    | ConstructorFunction<any> = SendFunction
> extends EthersContractTransaction {
  function: TFunction;
}

function propertyOf<TOr = any>(
  property: string,
  candidates: object[] = [],
): TOr {
  const obj = candidates.find((obj) => obj.hasOwnProperty(property));
  return (obj as any)?.[property] ?? undefined;
}

function enhanceResponse<
  TFunction extends
    | SendFunction<any, any>
    | ConstructorFunction<any> = SendFunction
>(
  fn: TFunction,
  response: ethers.ContractTransaction,
): ContractTransaction<TFunction> {
  const wait = response.wait.bind(response);
  const enhanced = (response as any) as ContractTransaction<TFunction>;
  enhanced.function = fn;
  enhanced.wait = async (confirmations?: number) => {
    const receipt = await wait(confirmations);
    const enhanced = (receipt as any) as ContractReceipt<TFunction>;
    enhanced.function = fn;
    return enhanced;
  };

  return enhanced;
}

export interface FunctionOptions<TArgs extends any[] = []> {
  args?: TArgs;
  value?: BigNumberish;
  nonce?: BigNumberish;
  gas?: BigNumberish;
  price?: BigNumberish;
  block?: providers.BlockTag;
  from?: AddressLike;
  bytecode?: BytesLike;
}

// TODO: Use param types to validate this instead.
export function isFunctionOptions<TArgs extends any[] = []>(
  value: any,
): value is FunctionOptions<TArgs> {
  if (typeof value === 'object' && !Array.isArray(value)) {
    if (BigNumber.isBigNumber(value)) {
      return false;
    }

    if (Signer.isSigner(value)) {
      return false;
    }

    if (value instanceof Contract) {
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
  TFragment extends Fragment = Fragment,
  TContract extends Contract = Contract
> {
  public static create<
    TArgs extends any[] = [],
    TFragment extends Fragment = Fragment,
    TContract extends Contract = Contract
  >(
    contract: TContract,
    fragment: TFragment,
    ...args: TArgs
  ): ContractFunction<TArgs, TFragment, TContract>;

  public static create<
    TArgs extends any[] = [],
    TFragment extends Fragment = Fragment,
    TContract extends Contract = Contract
  >(
    contract: TContract,
    fragment: TFragment,
    options: FunctionOptions<TArgs>,
  ): ContractFunction<TArgs, TFragment, TContract>;

  public static create<
    TArgs extends any[] = [],
    TFragment extends Fragment = Fragment,
    TContract extends Contract = Contract
  >(
    contract: TContract,
    fragment: TFragment,
    ...args: [FunctionOptions<TArgs>] | TArgs
  ) {
    const options = resolveFunctionOptions(...args) as FunctionOptions<TArgs>;
    if (FunctionFragment.isFunctionFragment(fragment)) {
      if (fragment.constant) {
        return new CallFunction<TArgs>(contract, fragment, options);
      }

      return new SendFunction<TArgs>(contract, fragment, options);
    }

    if (FunctionFragment.isConstructorFragment(fragment)) {
      return new ConstructorFunction<TArgs>(contract, fragment, options);
    }

    throw new Error('Invalid fragment');
  }

  constructor(
    public readonly contract: TContract,
    public readonly fragment: TFragment,
    public readonly options: FunctionOptions<TArgs> = {},
  ) {}

  public get ref() {
    return this.refine();
  }

  public args(...args: TArgs) {
    return this.refine({ args });
  }

  public value(value?: BigNumberish) {
    return this.refine({ value });
  }

  public bytecode(bytecode?: BytesLike) {
    return this.refine({ bytecode });
  }

  public nonce(nonce?: number) {
    return this.refine({ nonce });
  }

  public block(block?: providers.BlockTag) {
    return this.refine({ block });
  }

  public gas(limit?: BigNumberish, price?: BigNumberish) {
    return this.refine({ gas: limit, price });
  }

  public from(from?: AddressLike) {
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
> extends ContractFunction<TArgs, FunctionFragment, TContract> {
  protected populated?: Promise<PopulatedTransaction>;

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

  public attach(contract: TContract): this {
    const formatted = this.fragment.format();
    if (!contract.abi.functions.hasOwnProperty(formatted)) {
      throw new Error('Failed to attach function to incompatible contract');
    }

    return new (this.constructor as any)(contract, this.fragment, this.options);
  }

  public async populate(refresh = false) {
    if (!this.populated || refresh) {
      this.populated = new Promise(async (resolve, reject) => {
        try {
          const inputs = this.fragment.inputs;
          const args = await resolveArguments(inputs, this.options.args);
          const data = this.contract.abi.encodeFunctionData(
            this.fragment,
            args,
          );

          resolve({
            to: this.contract.address,
            data,
            ...(this.options.from && {
              from: await resolveAddress(this.options.from),
            }),
            ...(this.options.nonce && {
              nonce: BigNumber.from(this.options.nonce).toNumber(),
            }),
            ...(this.options.value && {
              value: BigNumber.from(this.options.value),
            }),
            ...(this.options.price && {
              gasPrice: BigNumber.from(this.options.price),
            }),
            ...(this.options.gas && {
              gasLimit: BigNumber.from(this.options.gas),
            }),
          });
        } catch (error) {
          reject(error);
        }
      });
    }

    return this.populated;
  }
}

export class SendFunction<
  TArgs extends any[] = [],
  TReturn extends any = void,
  TContract extends Contract = Contract
> extends CallFunction<TArgs, TReturn, TContract> {
  public async estimate(): Promise<BigNumber> {
    const tx = await this.populate();
    if (this.contract.provider == null) {
      throw new Error('Missing provider');
    }

    return this.contract.provider.estimateGas(tx);
  }

  public send(
    wait?: true,
  ): Promise<ContractReceipt<SendFunction<TArgs, TReturn, TContract>>>;
  public send(
    wait?: false,
  ): Promise<ContractTransaction<SendFunction<TArgs, TReturn, TContract>>>;
  public async send(
    wait: boolean = true,
  ): Promise<
    | ContractReceipt<SendFunction<TArgs, TReturn, TContract>>
    | ContractTransaction<SendFunction<TArgs, TReturn, TContract>>
  > {
    if (!this.contract.signer) {
      throw new Error('Missing signer');
    }

    const populated = await this.populate();
    const response = await this.contract.signer.sendTransaction(populated);
    const enhanced = enhanceResponse(this, response);

    if (!wait) {
      return enhanced;
    }

    return enhanced.wait() as Promise<
      ContractReceipt<SendFunction<TArgs, TReturn, TContract>>
    >;
  }
}

export class ConstructorFunction<
  TArgs extends any[] = [],
  TContract extends Contract = Contract
> extends ContractFunction<TArgs, ConstructorFragment, TContract> {
  protected populated?: Promise<PopulatedTransaction>;

  public async call(): Promise<string> {
    const tx = await this.populate();
    if (this.contract.provider == null) {
      throw new Error('Missing provider');
    }

    return this.contract.provider.call(tx);
  }

  public async estimate(): Promise<BigNumber> {
    const tx = await this.populate();
    if (this.contract.provider == null) {
      throw new Error('Missing provider');
    }

    return this.contract.provider.estimateGas(tx);
  }

  public send(
    wait?: true,
  ): Promise<ContractReceipt<ConstructorFunction<TArgs, TContract>>>;
  public send(
    wait?: false,
  ): Promise<ContractTransaction<ConstructorFunction<TArgs, TContract>>>;
  public async send(
    wait: boolean = true,
  ): Promise<
    | ContractTransaction<ConstructorFunction<TArgs, TContract>>
    | ContractReceipt<ConstructorFunction<TArgs, TContract>>
  > {
    if (!this.contract.signer) {
      throw new Error('Missing signer');
    }
    const populated = await this.populate();
    const response = await this.contract.signer.sendTransaction(populated);
    const enhanced = enhanceResponse(this, response);

    if (!wait) {
      return enhanced;
    }

    return enhanced.wait() as Promise<
      ContractReceipt<ConstructorFunction<TArgs, TContract>>
    >;
  }

  public async populate(refresh = false) {
    if (!this.populated || refresh) {
      this.populated = new Promise(async (resolve, reject) => {
        try {
          if (!this.options.bytecode) {
            throw new Error('Missing bytecode');
          }

          const inputs = this.fragment.inputs;
          const args = await resolveArguments(inputs, this.options.args);

          // Set the data to the bytecode + the encoded constructor arguments
          const data = utils.hexlify(
            utils.concat([
              this.options.bytecode,
              this.contract.abi.encodeDeploy(args),
            ]),
          );

          resolve({
            data,
            ...(this.options.nonce && {
              nonce: BigNumber.from(this.options.nonce).toNumber(),
            }),
            ...(this.options.price && {
              gasPrice: BigNumber.from(this.options.price),
            }),
            ...(this.options.gas && {
              gasLimit: BigNumber.from(this.options.gas),
            }),
          });
        } catch (error) {
          reject(error);
        }
      });
    }

    return this.populated;
  }
}
