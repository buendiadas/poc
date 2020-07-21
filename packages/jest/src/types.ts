import { BuidlerProvider } from './provider';

declare global {
  namespace globalThis {
    var provider: BuidlerProvider;
  }
}
