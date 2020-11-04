import { parse } from './parser';
import { inject } from './injector';
import { preprocess } from './preprocessor';

export function instrument(source: string, file: string) {
  // First, we run over the original file to get the source mapping.
  const original = parse(source, file);
  // Then we repeat the parsing after preprocessing the source.
  const target = parse(preprocess(source, original.ast), file);
  // Inject the `instrumentation` solidity statements into the source.
  const result = inject(target);

  return result;
}
