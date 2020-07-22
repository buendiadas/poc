// @ts-nocheck
import { EthereumProvider } from '@nomiclabs/buidler/types';

export function addListener(
  provider: EthereumProvider,
  event: string,
  handler: (...args: any) => void,
) {
  const init = provider._init.bind(provider);
  provider._init = async () => {
    if (provider._node !== undefined) {
      return;
    }

    await init();

    provider._node._vm.on(event, handler);
  };
}
