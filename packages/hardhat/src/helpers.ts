// @ts-nocheck
import type { EthereumProvider } from 'hardhat/types';
import type { EventEmitter } from 'events';

export function addListener(
  provider: EthereumProvider,
  event: string,
  handler: (...args: any) => void,
) {
  let inner: any = provider._provider;
  while (inner._wrapped) {
    inner = (inner as any)._wrapped;
  }

  const init = inner._init.bind(inner);

  let subscribed = false;
  let removed = false;

  inner._init = async () => {
    await init();

    if (!subscribed && !removed) {
      subscribed = true;
      const vm = inner._node._vm as EventEmitter;
      vm.on(event, handler);
    }
  };

  return () => {
    if (removed) {
      return;
    }

    removed = true;
    const vm = internal._node?._vm as EventEmitter;
    if (vm != null) {
      vm.off(event, handler);
    }
  };
}
