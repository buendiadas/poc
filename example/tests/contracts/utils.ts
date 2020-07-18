import { Artifact } from '@crestproject/ethers-contracts';

export function loadArtifact(name: string): Artifact {
  return require(`../../build/${name}.json`);
}
