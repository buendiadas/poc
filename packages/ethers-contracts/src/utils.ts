export function propertyOf<TOr = any>(
  property: string,
  candidates: object[] = [],
): TOr {
  const obj = candidates.find((obj) => obj.hasOwnProperty(property));
  return (obj as any)?.[property] ?? undefined;
}
