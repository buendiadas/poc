import { Fragment, Interface, JsonFragment, EventFragment } from '@ethersproject/abi';

export type PossibleEvent = string | Fragment | JsonFragment;
export function ensureEvent(event: string | PossibleEvent, abi?: Interface) {
  if (EventFragment.isEventFragment(event)) {
    return event;
  }

  if (typeof event === 'string') {
    if (event.indexOf('(') !== -1) {
      return EventFragment.from(event);
    }

    const fragment = abi?.getEvent(event);
    if (fragment != null) {
      return fragment;
    }
  }

  throw new Error('Failed to resolve event');
}
