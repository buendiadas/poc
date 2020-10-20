module.exports = {
  setupFilesAfterEnv: [require.resolve('./jest-setup')],
  testTimeout: 60000,
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
};
