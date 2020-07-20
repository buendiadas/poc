import path from 'path';
import { ConstructorFragment } from '@ethersproject/abi';
import { ethers } from 'ethers';
import { formatOutput } from './utils';

export function getInput(fragment: ConstructorFragment) {
  const inputs = fragment.inputs.map((input, index) => {
    const name = input.name || `$$${index}`;
    const type = getType(input, true);
    return `${name}: ${type}`;
  });

  return inputs.join(', ');
}

export function getOutput(fragment: ConstructorFragment) {
  if (!ethers.utils.FunctionFragment.isFunctionFragment(fragment)) {
    return 'void';
  }

  const outputs = fragment.outputs ?? [];
  if (!outputs.length) {
    return 'void';
  }

  if (outputs.length === 1) {
    return getType(outputs[0], false);
  }

  // If all output parameters are named and unique, we can specify the struct.
  const struct = outputs.every((item, index, array) => {
    if (!item.name) {
      return false;
    }

    const found = array.findIndex((inner) => inner.name === item.name);
    return found === index;
  });

  if (struct) {
    const kv = outputs.map((o) => `${o.name}: ${getType(o, false)}`);
    return `{ ${kv.join(', ')} }`;
  }

  // Otherwise, all we know is that it will be an array.
  return 'any[]';
}

export function getType(
  param: ethers.utils.ParamType,
  flexible?: boolean,
): string {
  if (param.type === 'address') {
    return 'string';
  }

  if (param.type === 'string') {
    return 'string';
  }

  if (param.type === 'bool') {
    return 'boolean';
  }

  if (param.type.substring(0, 5) === 'bytes') {
    return flexible ? 'ethers.utils.BytesLike' : 'string';
  }

  if (param.type.substring(0, 4) === 'uint') {
    return flexible ? 'ethers.BigNumberish' : 'ethers.BigNumber';
  }

  if (param.type === 'array' || param.type.substr(-1) === ']') {
    const type = getType(param.arrayChildren, flexible);
    const matches = param.type.match(/\[([0-9]*)\]$/);

    if (matches?.[1]) {
      // This is a fixed length array.
      const range = Array.from(Array(parseInt(matches[1], 10)).keys());
      return `[${range.map(() => type).join(', ')}]`;
    }

    // Arbitrary length array.
    return `${type}[]`;
  }

  if (param.type === 'tuple') {
    const struct = param.components.map((param, index) => {
      return `${param.name || `$$${index}`}: ${getType(param, flexible)}`;
    });

    return `{ ${struct.join(', ')} }`;
  }

  return 'any';
}

export function generateFunction(fragment: ethers.utils.FunctionFragment) {
  const type = fragment.constant ? 'Call' : 'Send';
  const input = getInput(fragment);
  const output = getOutput(fragment);
  return `${type}<(${input}) => ${output}>`;
}

export function generateFunctions(fragments: ethers.utils.FunctionFragment[]) {
  const functions = fragments.reduce((carry, fragment, index, array) => {
    const type = generateFunction(fragment);
    const found = array.findIndex((current) => fragment.name === current.name);

    // Only create a shortcut for the first function overload.
    if (index === found) {
      carry.push(`'${fragment.name}': ${type};`);
    }

    const signature = fragment.format();
    carry.push(`'${signature}': ${type}`);

    return carry;
  }, [] as string[]);

  return functions.join('\n');
}

export function generateConstructor(fragment: ConstructorFragment) {
  const input = getInput(fragment);
  return `(${input}) => void`;
}

export function generateContract(
  name: string,
  source: string,
  abi: ethers.utils.Interface,
) {
  const functions = generateFunctions(Object.values(abi.functions));
  const constructor = generateConstructor(abi.deploy);

  const output = `
    import { contract, Call, Send, Construct, Functions } from '@crestproject/ethers-contracts';

    export type ${name}Constructor = ${constructor};
    export interface ${name}Functions extends Functions {
      ${functions}
    }

    export const ${name} = contract.fromSolidity<${name}Functions, ${name}Constructor>(${source});
  `;

  return output;
}

export function generateContractFile(
  name: string,
  abi: ethers.utils.Interface,
  source: string,
) {
  return formatOutput(generateContract(name, source, abi));
}
