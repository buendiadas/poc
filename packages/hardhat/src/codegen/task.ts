import fs from 'fs-extra';
import path from 'path';
import deepmerge from 'deepmerge';
import { utils } from 'ethers';
import { task, extendConfig } from 'hardhat/config';
import { Artifact } from 'hardhat/types';
import { generateContract, formatOutput } from '@crestproject/codegen';
import type { CodeGeneratorConfig } from './types';

export * from './types';

extendConfig((config, userConfig) => {
  const defaults: CodeGeneratorConfig = {
    enabled: false,
    clear: true,
    include: [],
    exclude: [],
    typescript: {
      enabled: true,
      path: './typescript',
    },
    abi: {
      enabled: true,
      path: './abi',
    },
    bytecode: {
      enabled: true,
      path: './bytecode',
    },
  };

  const provided = userConfig.codeGenerator ?? {};
  config.codeGenerator = deepmerge<CodeGeneratorConfig>(defaults, provided as any);
});

task('compile', async (_, env, parent) => {
  await parent();

  const config = env.config.codeGenerator;
  if (!config.enabled) {
    return;
  }

  if (!config.abi.enabled && !config.bytecode.enabled && !config.typescript.enabled) {
    return;
  }

  const [abi, bytecode, typescript] = [
    config.abi.enabled && validateDir(env.config.paths.root, config.abi.path),
    config.bytecode.enabled && validateDir(env.config.paths.root, config.bytecode.path),
    config.typescript.enabled && validateDir(env.config.paths.root, config.typescript.path),
  ];

  const dirs = [abi, bytecode, typescript].filter(
    (item, index, array) => !!item && array.indexOf(item) === index,
  ) as string[];

  await Promise.all(
    dirs.map(async (dir) => {
      const exists = await fs.pathExists(dir);

      if (config.clear && exists) {
        await fs.remove(dir);
        await fs.mkdirp(dir);
      } else if (!exists) {
        await fs.mkdirp(dir);
      }
    }),
  );

  // Flatten the artifacts array (thus remove duplicates). This might eliminate
  // artifacts for identically named contracts that are actually different. For
  // simplicity, we simply don't support that *shrug*.
  let paths = (await env.artifacts.getArtifactPaths())
    .map((artifact) => ({
      path: artifact,
      name: artifactName(artifact),
    }))
    .filter((outer, index, array) => {
      return array.findIndex((inner) => inner.name === outer.name) === index;
    });

  if (config.include?.length) {
    paths = paths.filter((artifact) => {
      return config.include!.some((rule) => artifact.name.match(rule));
    });
  }

  if (config.exclude?.length) {
    paths = paths.filter((artifact) => {
      return !config.exclude?.some((rule) => artifact.name.match(rule));
    });
  }

  if (!paths.length) {
    console.error(`None of the compiled contract artifacts matched your include/exclude rules for code generation.`);
    return;
  }

  const artifacts = (
    await Promise.all(
      paths.map(async (item) => {
        const artifact = (await fs.readJson(item.path)) as Artifact;
        return { ...item, artifact };
      }),
    )
  ).filter((item) => !!item.artifact.abi.length);

  await Promise.all([
    void (abi && generateAbiFiles(abi, artifacts)),
    void (bytecode && generateBytecodeFiles(bytecode, artifacts)),
    void (typescript && generateTypeScriptFiles(typescript, artifacts)),
  ]);
});

interface ArtifactDescriptor {
  name: string;
  path: string;
  artifact: Artifact;
}

async function generateAbiFiles(dir: string, artifacts: ArtifactDescriptor[]): Promise<void> {
  await Promise.all(
    artifacts.map((artifact) => {
      const destination = path.resolve(dir, `${artifact.name}.json`);
      return fs.writeJson(destination, artifact.artifact.abi, {
        spaces: 2,
      });
    }),
  );
}

async function generateBytecodeFiles(dir: string, artifacts: ArtifactDescriptor[]): Promise<void> {
  await Promise.all(
    artifacts.map((artifact) => {
      const destination = path.resolve(dir, `${artifact.name}.bin.json`);
      const content = { bytecode: artifact.artifact.bytecode };
      return fs.writeJson(destination, content, {
        spaces: 2,
      });
    }),
  );
}

async function generateTypeScriptFiles(dir: string, artifacts: ArtifactDescriptor[]): Promise<void> {
  await Promise.all(
    artifacts.map((artifact) => {
      const imports = '@crestproject/crestproject';
      const abi = new utils.Interface(artifact.artifact.abi);
      const content = generateContract(artifact.name, artifact.artifact.bytecode, abi, imports);
      const formatted = formatOutput(content);
      const destination = path.join(dir, `${artifact.name}.ts`);
      return fs.writeFile(destination, formatted);
    }),
  );
}

function artifactName(artifactPath: string) {
  return path.basename(artifactPath, '.json');
}

function validateDir(root: string, relative: string) {
  const dir = path.resolve(root, relative);
  if (!dir.startsWith(root)) {
    throw new Error('@crestproject/hardhat/codegen: resolved path must be inside of project directory');
  }

  if (dir === root) {
    throw new Error('@crestproject/hardhat/codegen: resolved path must not be root directory');
  }

  return dir;
}
