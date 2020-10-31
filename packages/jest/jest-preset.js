module.exports = {
  setupFilesAfterEnv: [require.resolve('./jest-setup')],
  testTimeout: 240000,
  testEnvironment: 'node',
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
};
