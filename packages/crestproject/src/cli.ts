#!/usr/bin/env node

import path from 'path';
import yargs from 'yargs';

const extensions = [path.extname(__filename).slice(1)];

yargs
  .env('CRESTPROJECT')
  .pkgConf('crestproject')
  .commandDir('commands', { extensions })
  .demandCommand(1, '')
  .help().argv;
