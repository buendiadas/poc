export function prettierConfig(cwd: string = process.cwd()) {
  try {
    const prettier = require('prettier');
    return prettier.resolveConfig.sync(cwd);
  } catch (error) {
    return {};
  }
}

export function formatOutput(value: string) {
  try {
    const prettier = require('prettier');
    const defaults = prettierConfig();
    const options = {
      ...defaults,
      parser: 'typescript',
    };

    return prettier.format(value, options);
  } catch (error) {}

  return value;
}
