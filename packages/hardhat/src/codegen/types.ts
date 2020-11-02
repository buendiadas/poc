export interface CodeGeneratorConfig {
  enabled: boolean;
  clear: boolean;
  include?: string[];
  exclude?: string[];
  typescript: {
    enabled: boolean;
    path: string;
  },
  abi: {
    enabled: boolean;
    path: string;
  };
  bytecode: {
    enabled: boolean;
    path: string;
  };
}

export interface CodeGeneratorUserConfig {
  enabled?: boolean;
  clear?: boolean;
  include?: string[];
  exclude?: string[];
  typescript?: {
    enabled: boolean;
    path: string;
  },
  abi?: {
    enabled: boolean;
    path: string;
  };
  bytecode?: {
    enabled: boolean;
    path: string;
  };
}

declare module 'hardhat/types/config' {
  export interface HardhatUserConfig {
    codeGenerator?: CodeGeneratorUserConfig;
  }

  export interface HardhatConfig {
    codeGenerator: CodeGeneratorConfig;
  }
}
