import { utils } from 'ethers';
import { resolveAddress, resolveAddressAsync } from './resolveAddress';

export function resolveArguments(
  params: utils.ParamType | utils.ParamType[],
  value: any
): any {
  if (Array.isArray(params)) {
    return params.map((type, index) => {
      const inner = Array.isArray(value) ? value[index] : value[type.name];
      return resolveArguments(type, inner);
    });
  }

  if (params.type === 'address') {
    return resolveAddress(value);
  }

  if (params.type === 'tuple') {
    return resolveArguments(params.components, value);
  }

  if (params.baseType === 'array') {
    if (!Array.isArray(value)) {
      throw new Error('Invalid array value');
    }

    return value.map((inner) => {
      return resolveArguments(params.arrayChildren, inner);
    });
  }

  return value;
}

export function resolveArgumentsAsync(
  params: utils.ParamType | utils.ParamType[],
  value: any
): Promise<any> {
  if (Array.isArray(params)) {
    return Promise.all(
      params.map((type, index) => {
        const inner = Array.isArray(value) ? value[index] : value[type.name];
        return resolveArgumentsAsync(type, inner);
      })
    );
  }

  if (params.type === 'address') {
    return resolveAddressAsync(value);
  }

  if (params.type === 'tuple') {
    return resolveArgumentsAsync(params.components, value);
  }

  if (params.baseType === 'array') {
    if (!Array.isArray(value)) {
      throw new Error('Invalid array value');
    }

    return Promise.all(
      value.map((inner) => {
        return resolveArgumentsAsync(params.arrayChildren, inner);
      })
    );
  }

  return value;
}
