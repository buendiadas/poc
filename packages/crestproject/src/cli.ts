import yargs from 'yargs';
import * as codegen from './commands/codegen';

yargs
  .env('CRESTPROJECT')
  .pkgConf('crestproject')
  .command(codegen)
  .demandCommand(1, '')
  .help().argv;
