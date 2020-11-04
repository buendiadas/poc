import { v4 as uuid } from 'uuid';
import os from 'os';
import fs from 'fs-extra';
import path from 'path';

export default async () => {
  // Make the shared tmp directory available to the test environment.
  process.env.__HARDHAT_COVERAGE_TEMPDIR__ = path.join(await fs.realpath(os.tmpdir()), uuid());
};
