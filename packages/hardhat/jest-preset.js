const inherited = require('@crestproject/jest/jest-preset');

module.exports = {
  ...inherited,
  testEnvironment: require.resolve('@crestproject/hardhat/jest/environment'),
  globalSetup: require.resolve('@crestproject/hardhat/jest/setup'),
  globalTeardown: require.resolve('@crestproject/hardhat/jest/teardown'),
};
