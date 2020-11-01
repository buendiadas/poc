import diff from 'jest-diff';
import { utils } from 'ethers';
import { matcherHint } from 'jest-matcher-utils';
import { resolveArguments } from '@crestproject/ethers';
import { forceFail } from '../../utils';
import { resolveFunctionFragment, resolveParamMatchers } from '../helpers';

export function toMatchFunctionInput(
  this: jest.MatcherContext,
  received: any,
  fragment: string | utils.FunctionFragment,
  expected?: any,
) {
  const invert = this.isNot;
  let resolvedFragment: utils.FunctionFragment;
  let receivedParams: any;
  let expectedMatchers: any;

  try {
    resolvedFragment = resolveFunctionFragment(fragment);
  } catch (e) {
    return forceFail('Failed to resolve function fragment', invert);
  }

  const types = resolvedFragment.inputs;

  try {
    const params = types.length === 1 ? types[0] : types;
    receivedParams = resolveArguments(params, received);
  } catch (e) {
    return forceFail('Failed to resolve received arguments', invert);
  }

  try {
    const params = types.length === 1 ? types[0] : types;
    expectedMatchers = resolveParamMatchers(params, expected);
  } catch (e) {
    return forceFail('Failed to resolve expected matchers', invert);
  }

  const pass = this.equals(receivedParams, expectedMatchers);
  const message = pass
    ? () => matcherHint('.not.toMatchFunctionInput')
    : () =>
        `${matcherHint('.toMatchFunctionInput')}\n\n${diff(
          receivedParams,
          expectedMatchers,
        )}`;

  return { pass, message };
}
