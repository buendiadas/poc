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
      preset: '@crestproject/hardhat',
    },
    {
      ...common('@crestproject/evm'),
      preset: '@crestproject/hardhat',
    },
    {
      ...common('@crestproject/ethers'),
      preset: '@crestproject/hardhat',
    },
    {
      ...common('@crestproject/hardhat'),
      preset: '@crestproject/hardhat',
    },
  ],
};
