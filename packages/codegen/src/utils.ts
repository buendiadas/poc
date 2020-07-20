export function formatOutput(value: string) {
  try {
    const prettier = require('prettier');
    const config = prettier.resolveConfig.sync(process.cwd());
    const options = {
      ...config,
      parser: 'typescript',
    };

    return prettier.format(value, options);
  } catch (error) {}

  return value;
}
