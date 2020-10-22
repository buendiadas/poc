const defaults = {
  roots: ['<rootDir>/tests'],
  globals: {
    'ts-jest': {
      diagnostics: {
        warnOnly: true,
      },
    },
  },
};

module.exports = {
  projects: [
    {
      ...defaults,
      displayName: 'ganache',
      preset: '@crestproject/ganache',
      testEnvironmentOptions: {
        ganacheProviderOptions: {
          gasLimit: 0x989680,
          defaultBalanceEther: 10000000000000,
        },
      },
    },
    {
      ...defaults,
      displayName: 'hardhat',
      preset: '@crestproject/hardhat',
    },
  ],
};
