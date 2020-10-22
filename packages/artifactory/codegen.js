const fs = require('fs-extra');
const path = require('path');
const { utils } = require('ethers');
const {
  formatOutput,
  generateContractForSolidityArtifact,
} = require('@crestproject/codegen');

function generate(file) {
  const name = path.basename(file, '.json');
  const contract = require(file);
  const source = require.resolve(file);
  const destination = path.resolve(__dirname, `src/codegen/${name}.ts`);

  let relative = path.relative(path.dirname(destination), source);
  if (!relative.startsWith('.')) {
    relative = `./${relative}`;
  }

  const abi = new utils.Interface(contract.abi);
  const output = generateContractForSolidityArtifact(name, relative, abi);
  const formatted = formatOutput(output);

  fs.outputFileSync(destination, formatted);
}

generate('./src/artifacts/contracts/AmIRichAlready.sol/BasicToken.json');
generate('./src/artifacts/contracts/AmIRichAlready.sol/AmIRichAlready.json');
