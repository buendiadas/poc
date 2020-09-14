import { Interface, EventFragment } from '@ethersproject/abi';
import { ContractReceipt, SendFunction } from '../function';
import { ensureEvent } from './ensureEvent';

// TODO: Add proper return type based on the event fragment's underlying type.
export function extractEvent<TFunction extends SendFunction<any, any>>(
  receipt: ContractReceipt<TFunction>,
  event: string | EventFragment
) {
  const contract = receipt.function.contract.abi;
  const fragment = ensureEvent(event, contract);
  const abi = new Interface([fragment]);
  const topic = abi.getEventTopic(fragment);
  const matches = (receipt.logs ?? [])
    .filter((item) => item.topics.includes(topic))
    .map((log) => abi.parseLog(log));

  return matches;
}