import diff from 'jest-diff';
import { utils } from 'ethers';
import { matcherHint } from 'jest-matcher-utils';
import { resolveArguments } from '@crestproject/ethers';
import { forceFail } from '../../utils';
import { resolveParamMatchers } from '../helpers';

export function toMatchEventArgs(
  this: jest.MatcherContext,
  received: utils.LogDescription,
  expected?: any,
) {
  const invert = this.isNot;
  let receivedParams: any;
  let expectedMatchers: any;

  const types = received.eventFragment.inputs;

  try {
    receivedParams = resolveArguments(types, received.args);
  } catch (e) {
    return forceFail(`Failed to resolve received arguments: ${e}`, invert);
  }

  try {
    expectedMatchers = resolveParamMatchers(types, expected);
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
