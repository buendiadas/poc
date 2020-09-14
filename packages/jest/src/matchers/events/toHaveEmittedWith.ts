import { utils } from 'ethers';
import { ContractReceipt, extractEvent } from '@crestproject/ethers';

export function toHaveEmittedWith(
  this: jest.MatcherContext,
  receipt: ContractReceipt,
  event: string | utils.EventFragment,
  matcher: (matches: utils.LogDescription[]) => void
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
        this.utils.matcherHint('.not.toHaveEmitted') +
        '\n\n' +
        `Expected event not to have been emitted\n` +
        `  ${this.utils.printExpected(signature)}\n` +
        `Actual:\n` +
        `  ${this.utils.printReceived(
          `Event was emitted ${matches?.length ?? 0} times`
        )}`
    : () =>
        this.utils.matcherHint('.toHaveEmitted') +
        '\n\n' +
        `Expected event to have been emitted\n` +
        `  ${this.utils.printExpected(signature)}\n` +
        `Actual:\n` +
        `  ${this.utils.printReceived(
          `Event was emitted ${matches?.length ?? 0} times`
        )}`;

  matcher(matches);

  return { pass, message };
}
