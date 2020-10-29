module.exports = {
  setupFilesAfterEnv: [require.resolve('./jest-setup')],
  testTimeout: 60000,
  testEnvironment: 'node',
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
};
