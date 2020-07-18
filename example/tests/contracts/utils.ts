import { SolidityCompilerOutput } from '@crestproject/ethers-contracts';

export function loadArtifact(name: string): SolidityCompilerOutput {
  return require(`../../build/${name}.json`);
}
