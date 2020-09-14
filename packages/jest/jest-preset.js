module.exports = {
  testEnvironment: require.resolve('./dist/preset/setup-env'),
  setupFilesAfterEnv: [require.resolve('./dist/preset/setup-after-env')],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
};
