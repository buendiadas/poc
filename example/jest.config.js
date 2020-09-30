module.exports = {
  preset: '@crestproject/crestproject',
  testEnvironmentOptions: {
    buidlerConfigs: [require.resolve('./buidler.config')],
  },
  roots: ['<rootDir>/tests'],
  globals: {
    'ts-jest': {
      diagnostics: {
        warnOnly: true,
      },
    },
  },
};
