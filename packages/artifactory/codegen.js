const fs = require('fs-extra');
const path = require('path');
const { utils } = require('ethers');
const { formatOutput, generateContract } = require('@crestproject/codegen');

function generate(file) {
  const name = path.basename(file, '.json');
  const contract = require(file);
  const destination = path.resolve(__dirname, `src/codegen/${name}.ts`);

  const abi = new utils.Interface(contract.abi);
  const output = generateContract(name, contract.bytecode, abi);
  const formatted = formatOutput(output);

  fs.outputFileSync(destination, formatted);
}

generate('./artifacts/contracts/AmIRichAlready.sol/BasicToken.json');
generate('./artifacts/contracts/AmIRichAlready.sol/AmIRichAlready.json');
