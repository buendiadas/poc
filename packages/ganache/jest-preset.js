const inherited = require('@crestproject/jest/jest-preset');

module.exports = {
  ...inherited,
  testEnvironment: require.resolve('@crestproject/ganache/jest'),
};
