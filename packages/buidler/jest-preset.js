const inherited = require('@crestproject/jest/jest-preset');

module.exports = {
  ...inherited,
  testEnvironment: require.resolve('./dist/preset/setup-env'),
};
