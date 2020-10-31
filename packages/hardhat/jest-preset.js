const inherited = require('@crestproject/jest/jest-preset');

module.exports = {
  ...inherited,
  setupFilesAfterEnv: [
    ...inherited.setupFilesAfterEnv,
    require.resolve('./jest-setup'),
  ],
};
