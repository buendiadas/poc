module.exports = {
  networks: {
    hardhat: {
      loggingEnabled: true,
      gas: 9500000,
      accounts: {
        mnemonic: 'test test test test test test test test test test test junk',
        count: 10,
      },
    },
  },
  solidity: {
    version: '0.6.8',
  },
};
