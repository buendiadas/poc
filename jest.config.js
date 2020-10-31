const path = require('path');

function common(package) {
  return {
    roots: ['<rootDir>/tests'],
    rootDir: path.dirname(require.resolve(`${package}/package.json`)),
    displayName: package,
    globals: {
      'ts-jest': {
        babelConfig: true,
        diagnostics: {
          warnOnly: true,
        },
      },
    },
  };
}

module.exports = {
  testTimeout: 60000,
  projects: [
    {
      ...common('@crestproject/codegen'),
      preset: 'ts-jest',
    },
    {
      ...common('@crestproject/jest'),
      preset: '@crestproject/jest',
    },
    {
      ...common('@crestproject/ethers'),
      preset: '@crestproject/jest',
    },
    {
      ...common('@crestproject/evm'),
      preset: '@crestproject/jest',
    },
    {
      ...common('@crestproject/hardhat'),
      preset: '@crestproject/hardhat',
    },
  ],
};
