const { HardhatProvider } = require('@crestproject/hardhat');

let reset;

beforeAll(() => {
  jest.isolateModules(() => {
    const network = require('hardhat').network;
    reset = require('hardhat/internal/reset').resetHardhatContext;
    global.provider = new HardhatProvider(network);
  });
});

afterAll(() => {
  reset();
});
