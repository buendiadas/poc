import ganache from 'ganache-core';

export function addListener(
  provider: ganache.Provider,
  event: string,
  handler: (value: any) => void
) {
  const blockchain = (provider as any).engine.manager.state.blockchain;

  let subscribed = false;
  let removed = false;
  let vm: any;

  const createVMFromStateTrie = blockchain.createVMFromStateTrie;
  blockchain.createVMFromStateTrie = (...args: any[]) => {
    vm = createVMFromStateTrie.apply(blockchain, args);

    if (!subscribed) {
      subscribed = true;
      vm.on(event, handler);
    }

    return vm;
  };

  return () => {
    if (removed) {
      return;
    }

    removed = true;
    if (vm != null) {
      vm.off(event, handler);
    }
  };
}
