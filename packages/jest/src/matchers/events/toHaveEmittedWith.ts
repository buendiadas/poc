import { utils } from 'ethers';
import { ContractReceipt, extractEvent } from '@crestproject/ethers';
import { printReceived, printExpected, matcherHint } from 'jest-matcher-utils';

export function toHaveEmittedWith(
  this: jest.MatcherContext,
  receipt: ContractReceipt,
  event: string | utils.EventFragment,
  matcher: (matches: utils.LogDescription[]) => void,
): jest.CustomMatcherResult {
  const abi = receipt.function.contract.abi;
  const fragment = utils.EventFragment.isEventFragment(event)
    ? event
    : abi.getEvent(event);

  const matches = extractEvent(receipt, fragment);
  const signature = fragment.format();
  const pass = !!matches?.length;
  const message = pass
    ? () =>
        matcherHint('.not.toHaveEmitted') +
        '\n\n' +
        `Expected event not to have been emitted\n` +
        `  ${printExpected(signature)}\n` +
        `Actual:\n` +
        `  ${printReceived(`Event was emitted ${matches?.length ?? 0} times`)}`
    : () =>
        matcherHint('.toHaveEmitted') +
        '\n\n' +
        `Expected event to have been emitted\n` +
        `  ${printExpected(signature)}\n` +
        `Actual:\n` +
        `  ${printReceived(`Event was emitted ${matches?.length ?? 0} times`)}`;

  matcher(matches);

  return { pass, message };
}
