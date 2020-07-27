export function forceFail(
  context: jest.MatcherContext,
  value: any,
  error: string,
) {
  const pass = context.isNot ? true : false;
  const message = () =>
    `${error}:\n\n` + `  ${context.utils.printReceived(value)}`;

  return { pass, message };
}
