import { BranchMapping, FunctionMapping, Range } from 'istanbul-lib-coverage';
import { Instrumentations } from '../../coverage';

export interface CodeCoverageContractMetadata {
  path: string;
  functions: FunctionMapping[];
  branches: BranchMapping[];
  statements: Range[];
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
