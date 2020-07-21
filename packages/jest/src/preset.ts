export default {
  testEnvironment: require.resolve('./setup/setup-env'),
  setupFilesAfterEnv: [require.resolve('./setup/setup-after-env')],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
};
