import { BigNumber, utils } from 'ethers';
import { Contract, resolveAddress } from '@crestproject/ethers';

export function resolveFunctionFragment(
  subject: Contract<any> | utils.FunctionFragment | string,
  fragment?: string | utils.FunctionFragment,
) {
  const resolved = resolveFragment(subject, fragment);
  if (!utils.FunctionFragment.isFunctionFragment(resolved)) {
    throw new Error(
      `Failed to resolve function fragment. Received event fragment ${resolved.format()}`,
    );
  }

  return resolved;
}

export function resolveEventFragment(
  subject: Contract<any> | utils.EventFragment | string,
  fragment?: string | utils.EventFragment,
) {
  const resolved = resolveFragment(subject, fragment);
  if (!utils.EventFragment.isEventFragment(resolved)) {
    throw new Error(
      `Failed to resolve event fragment. Received function fragment ${resolved.format()}`,
    );
  }

  return resolved;
}

export function resolveFragment(
  subject:
    | Contract<any>
    | utils.EventFragment
    | utils.FunctionFragment
    | string,
  fragment?: string | utils.EventFragment | utils.FunctionFragment,
): utils.EventFragment | utils.FunctionFragment {
  if (
    utils.EventFragment.isEventFragment(subject) ||
    utils.FunctionFragment.isFunctionFragment(subject)
  ) {
    return subject;
  }

  if (
    utils.EventFragment.isEventFragment(fragment) ||
    utils.FunctionFragment.isFunctionFragment(fragment)
  ) {
    return fragment;
  }

  if (fragment == null && typeof subject === 'string' && subject.indexOf('(')) {
    const fragment = utils.Fragment.fromString(subject);

    if (
      utils.EventFragment.isEventFragment(fragment) ||
      utils.FunctionFragment.isFunctionFragment(fragment)
    ) {
      return fragment;
    }
  }

  if (Contract.isContract(subject)) {
    if (fragment == null) {
      throw new Error('Missing event/function fragment or name');
    }

    if (utils.isHexString(fragment)) {
      for (const name in subject.abi.functions) {
        if (fragment === subject.abi.getSighash(name)) {
          return subject.abi.functions[name];
        }
      }

      for (const name in subject.abi.events) {
        if (fragment === subject.abi.getSighash(name)) {
          return subject.abi.functions[name];
        }
      }
    } else if (fragment.indexOf('(') === -1) {
      const name = fragment.trim();
      const fns = Object.entries(subject.abi.functions);
      const events = Object.entries(subject.abi.events);
      const [, match] =
        [...fns, ...events].find(([key]) => {
          return key.split('(')[0] === name;
        }) ?? [];

      if (match != null) {
        return match;
      }
    }
  }

  throw new Error(`Failed to resolve function or event fragment ${fragment}`);
}

const asymmetricMatcher = Symbol.for('jest.asymmetricMatcher');

export function resolveParamMatchers(
  params: utils.ParamType | utils.ParamType[],
  value: any,
): any {
  if (typeof value === 'undefined') {
    return expect.anything();
  }

  if (value?.$$typeof === asymmetricMatcher) {
    return value;
  }

  if (Array.isArray(params)) {
    return params.map((type, index) => {
      const inner = Array.isArray(value) ? value[index] : value?.[type.name];
      return resolveParamMatchers(type, inner);
    });
  }

  if (params.type === 'address') {
    return resolveAddress(value);
  }

  if (params.type === 'tuple') {
    return resolveParamMatchers(params.components, value);
  }

  if (params.baseType === 'array') {
    if (!Array.isArray(value)) {
      throw new Error('Invalid array value');
    }

    return value.map((inner) => {
      return resolveParamMatchers(params.arrayChildren, inner);
    });
  }

  if (params.type.match(/^u?int/)) {
    return `${BigNumber.from(value)}`;
  }

  return value;
}
