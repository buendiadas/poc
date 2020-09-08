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

export function getRawOutput(fragment: ConstructorFragment) {
  if (!ethers.utils.FunctionFragment.isFunctionFragment(fragment)) {
    return '[]';
  }

  const outputs = (fragment.outputs ?? []).map((output, index) => {
    const name = output.name || `$$${index}`;
    const type = getType(output, true);
    return `${name}: ${type}`;
  });

  return `[${outputs.join(', ')}]`;
}

export function getType(
  param: ethers.utils.ParamType,
  flexible?: boolean,
): string {
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

  if (param.type === 'address') {
    return flexible ? 'AddressLike' : 'string';
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

  return 'any';
}

export function generateFunction(
  contract: string,
  fragment: ethers.utils.FunctionFragment,
) {
  const type = fragment.constant ? 'Call' : 'Send';
  const input = getInput(fragment);
  const output = getOutput(fragment);
  return `${type}<(${input}) => ${output}, ${contract}>`;
}

export function generateFunctions(
  contract: string,
  fragments: ethers.utils.FunctionFragment[],
) {
  if (!fragments.length) {
    return '';
  }

  const [short, full] = fragments.reduce(
    ([short, full], fragment, index, array) => {
      const type = generateFunction(contract, fragment);
      const found = array.findIndex(
        (current) => fragment.name === current.name,
      );

      // Only create a shortcut for the first function overload.
      if (index === found) {
        short.push(`${fragment.name}: ${type}`);
      }

      const signature = fragment.format();
      full.push(`'${signature}': ${type}`);

      return [short, full] as [string[], string[]];
    },
    [[], []] as [string[], string[]],
  );

  return `// Shortcuts (using function name of first overload)
  ${short.join('\n  ')}

  // Explicit accessors (using full function signature)
  ${full.join('\n  ')}`;
}

export function generateConstructorArgs(fragment: ConstructorFragment) {
  const input = getInput(fragment);
  return input ? `[${input}]` : '';
}

export function generateContractForSolidityArtifact(
  name: string,
  source: string,
  abi: ethers.utils.Interface,
  crestproject: string = '@crestproject/crestproject',
) {
  const functions = generateFunctions(name, Object.values(abi.functions));
  const constructor = generateConstructorArgs(abi.deploy);
  const generic = `${name}${constructor ? `, ${name}Args` : ''}`;

  // prettier-ignore
  return `/* eslint-disable */
// @ts-nocheck
import { ethers } from 'ethers';
import { contract, Call, Send, AddressLike, Contract } from '${crestproject}';
import ${name}Artifact from '${source}';

${constructor ? `export type ${name}Args = ${constructor};` : ''}

// prettier-ignore
export interface ${name} extends Contract<${name}> {
  ${functions || '// No external functions'}
}

export const ${name} = contract.fromArtifact<${generic}>(${name}Artifact);`;
}

export function generateContractForSignatures(
  name: string,
  abi: ethers.utils.Interface,
  crestproject: string = '@crestproject/crestproject',
) {
  const functions = generateFunctions(name, Object.values(abi.functions));
  const constructor = generateConstructorArgs(abi.deploy);
  const generic = `${name}${constructor ? `, ${name}Args` : ''}`;
  const formatted = abi.format();

  // prettier-ignore
  return `/* eslint-disable */
// @ts-nocheck
import { ethers } from 'ethers';
import { contract, Call, Send, AddressLike, Contract } from '${crestproject}';

${constructor ? `export type ${name}Args = ${constructor};` : ''}

// prettier-ignore
export interface ${name} extends Contract<${name}> {
  ${functions || '// No external functions'}
}

export const ${name} = contract.fromSignatures<${generic}>\`
  ${Array.isArray(formatted) ? formatted.join('\n  ') : formatted}
\`;`;
}
