import diff from 'jest-diff';
import { utils } from 'ethers';
import { matcherHint } from 'jest-matcher-utils';
import { resolveArguments } from '@crestproject/ethers';
import { forceFail } from '../../utils';
import { resolveEventFragment, resolveParamMatchers } from '../helpers';

export function toMatchEventArgs(
  this: jest.MatcherContext,
  received: any,
  fragment: string | utils.EventFragment,
  expected?: any,
) {
  const invert = this.isNot;
  let resolvedFragment: utils.EventFragment;
  let receivedParams: any;
  let expectedMatchers: any;

  try {
    resolvedFragment = resolveEventFragment(fragment);
  } catch (e) {
    return forceFail(`Failed to resolve event fragment: ${e}`, invert);
  }

  const types = resolvedFragment.inputs;

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
    ? () => matcherHint('.not.toMatchEventArgs')
    : () =>
        `${matcherHint('.toMatchEventArgs')}\n\n${diff(
          receivedParams,
          expectedMatchers,
        )}`;

  return { pass, message };
}
