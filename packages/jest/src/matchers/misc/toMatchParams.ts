import diff from 'jest-diff';
import { matcherHint } from 'jest-matcher-utils';
import { utils } from 'ethers';
import { resolveArguments } from '@crestproject/ethers';
import { forceFail } from '../../utils';
import { resolveParamMatchers } from '../helpers';

export function toMatchParams(
  this: jest.MatcherContext,
  received: any,
  types: utils.ParamType | utils.ParamType[],
  expected: any,
) {
  const invert = this.isNot;
  let receivedParams: any;
  let expectedMatchers: any;

  const printed = Array.isArray(types)
    ? types.map((type) => type.format()).join(', ')
    : types.format();

  try {
    const receivedArray =
      Array.isArray(types) && !Array.isArray(received) ? [received] : received;

    receivedParams = resolveArguments(types, receivedArray);
  } catch (e) {
    return forceFail(`Failed to resolve received arguments: ${e}`, invert);
  }

  try {
    const expectedArray =
      Array.isArray(types) && !Array.isArray(expected) ? [expected] : expected;

    expectedMatchers = resolveParamMatchers(types, expectedArray);
  } catch (e) {
    return forceFail(`Failed to resolve received arguments: ${e}`, invert);
  }

  const pass = this.equals(receivedParams, expectedMatchers);
  const message = pass
    ? () => matcherHint('.not.toMatchParams', printed)
    : () =>
        `${matcherHint('.toMatchParams', printed)}\n\n${diff(
          receivedParams,
          expectedMatchers,
        )}`;

  return { pass, message };
}
