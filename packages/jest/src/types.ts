import { BuidlerProvider } from '@crestproject/evm';

declare global {
  namespace globalThis {
    var provider: BuidlerProvider;
  }
}
