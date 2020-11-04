import { RegisteredFunctions, RegisteredStatements, RegisteredBranches, Instrumentations } from '../../coverage';

export interface CodeCoverageContractMetadata {
  path: string;
  functions: RegisteredFunctions;
  statements: RegisteredStatements;
  branches: RegisteredBranches;
  lines: number[];
}

export interface CodeCoverageMetadata {
  contracts: Record<string, CodeCoverageContractMetadata>;
  instrumentation: Instrumentations;
}

export interface CodeCoverageRuntimeRecording {
  metadata: string;
  hits: Record<string, number>;
}

export interface CodeCoverageConfig {
  path: string;
  include: string[];
  exclude: string[];
  clear: boolean;
}

export interface CodeCoverageUserConfig {
  path?: string;
  include?: string[];
  exclude?: string[];
  clear?: boolean;
}

declare module 'hardhat/types/config' {
  export interface HardhatUserConfig {
    codeCoverage?: CodeCoverageUserConfig;
  }

  export interface HardhatConfig {
    codeCoverage: CodeCoverageConfig;
  }
}
