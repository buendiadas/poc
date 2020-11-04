import path from 'path';
import fs from 'fs-extra';

export function validateDir(root: string, relative: string) {
  const dir = path.resolve(root, relative);
  if (!dir.startsWith(root)) {
    throw new Error('@crestproject/hardhat: resolved path must be inside of project directory');
  }

  if (dir === root) {
    throw new Error('@crestproject/hardhat: resolved path must not be root directory');
  }

  return dir;
}

export async function clearDirectory(dir: string) {
  if (await fs.pathExists(dir)) {
    await fs.remove(dir);
  }
}

export async function createDirectory(dir: string) {
  if (!(await fs.pathExists(dir))) {
    await fs.mkdirp(dir);
  }
}

export async function prepareDirectory(dir: string, clear: boolean = false) {
  if (clear) {
    await clearDirectory(dir);
  }

  return createDirectory(dir);
}
