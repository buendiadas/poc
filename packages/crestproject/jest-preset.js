const candidates = [
  '@crestproject/buidler/jest-preset',
  '@crestproject/ganache/jest-preset',
  '@crestproject/jest/jest-preset',
];

const preferred = candidates.find((candidate) => {
  try {
    require.resolve(candidate);
    return true;
  } catch {
    return false;
  }
});

if (!preferred) {
  throw new Error('Failed to resolve jest preset for crestproject');
}

module.exports = require(preferred);
