import { ContractReceipt } from '@crestproject/ethers';

export function toHaveEmitted(
  this: jest.MatcherContext,
  receipt: ContractReceipt,
  event: string,
): jest.CustomMatcherResult {
  const abi = receipt.function.contract.abi;
  const fragment = abi.getEvent(event);
  const topic = abi.getEventTopic(fragment);
  const matches = (receipt.logs ?? []).filter((item) => {
    return item.topics.includes(topic);
  });

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
          `Event was emitted ${matches?.length ?? 0} times`,
        )}`
    : () =>
        this.utils.matcherHint('.toHaveEmitted') +
        '\n\n' +
        `Expected event to have been emitted\n` +
        `  ${this.utils.printExpected(signature)}\n` +
        `Actual:\n` +
        `  ${this.utils.printReceived(
          `Event was emitted ${matches?.length ?? 0} times`,
        )}`;

  return { pass, message };
}
