import { EthereumProvider } from '@nomiclabs/buidler/types';
import { EventEmitter } from 'events';

export function addListener(
  provider: EthereumProvider,
  event: string,
  handler: (...args: any) => void,
) {
  const internal = provider as any;
  const init = internal._init.bind(internal);

  let subscribed = false;
  let removed = false;

  internal._init = async () => {
    await init();

    if (!subscribed && !removed) {
      subscribed = true;
      const vm = internal._node._vm as EventEmitter;
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
