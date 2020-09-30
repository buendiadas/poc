module.exports = {
  setupFilesAfterEnv: [require.resolve('./dist/preset/setup-after-env')],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
};
