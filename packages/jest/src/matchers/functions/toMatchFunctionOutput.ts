import diff from 'jest-diff';
import { utils } from 'ethers';
import { matcherHint } from 'jest-matcher-utils';
import { resolveArguments } from '@crestproject/ethers';
import { forceFail } from '../../utils';
import { resolveFunctionFragment, resolveParamMatchers } from '../helpers';

export function toMatchFunctionOutput(
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
    return forceFail(`Failed to resolve function fragment: ${e}`, invert);
  }

  if (!resolvedFragment.outputs) {
    return forceFail(
      `The function fragment does not have any output signature: ${resolvedFragment.format()}`,
      invert,
    );
  }

  const types = resolvedFragment.outputs;

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
    return forceFail(`Failed to resolve expected matchers: ${e}`, invert);
  }

  const pass = this.equals(receivedParams, expectedMatchers);
  const message = pass
    ? () => matcherHint('.not.toMatchFunctionOutput')
    : () =>
        `${matcherHint('.toMatchFunctionOutput')}\n\n${diff(
          receivedParams,
          expectedMatchers,
        )}`;

  return { pass, message };
}
