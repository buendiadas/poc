import { parse } from './parser';
import { inject } from './injector';
import { preprocess } from './preprocessor';

export function instrument(source: string, file: string) {
  // Preprocess and parse the source.
  const target = parse(preprocess(source), file);
  // Inject the `instrumentation` solidity statements into the source.
  const result = inject(target);

  return result;
}
