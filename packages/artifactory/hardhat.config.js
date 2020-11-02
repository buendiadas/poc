require('@crestproject/hardhat/codegen');

module.exports = {
  solidity: {
    version: '0.6.8',
  },
  codeGenerator: {
    enabled: true,
    clear: true,
    bytecode: {
      path: './src/bytecode',
    },
    abi: {
      path: './src/abi',
    },
    typescript: {
      path: './src/codegen',
    },
  },
};
