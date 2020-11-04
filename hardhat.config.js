require('@crestproject/hardhat/plugin');

module.exports = {
  solidity: {
    version: '0.6.8',
  },
  networks: {
    hardhat: {
      // loggingEnabled: true,
      gas: 9500000,
      accounts: {
        mnemonic: 'test test test test test test test test test test test junk',
        count: 10,
      },
    },
  },
  codeGenerator: {
    enabled: true,
    clear: true,
    bytecode: {
      path: './packages/artifactory/src/bytecode',
    },
    abi: {
      path: './packages/artifactory/src/abi',
    },
    typescript: {
      path: './packages/artifactory/src/codegen',
    },
  },
  codeCoverage: {
    path: './cache/coverage',
  },
  paths: {
    sources: './contracts',
  },
};
