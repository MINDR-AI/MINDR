#!/usr/bin/env node

import { Command } from 'commander';
import { createAgent } from './commands/create';
import { startAgent } from './commands/start';
import { stopAgent } from './commands/stop';
import { listAgents } from './commands/list';

const program = new Command();

program
  .name('mindr')
  .description('MINDR Command Line Interface')
  .version('0.1.0');

program
  .command('create')
  .description('Create a new agent project')
  .argument('<name>', 'agent project name')
  .option('-t, --template <template>', 'template to use', 'basic')
  .action(createAgent);

program
  .command('start')
  .description('Start an agent')
  .argument('<id>', 'agent ID')
  .option('-c, --config <path>', 'path to config file')
  .action(startAgent);

program
  .command('stop')
  .description('Stop an agent')
  .argument('<id>', 'agent ID')
  .action(stopAgent);

program
  .command('list')
  .description('List running agents')
  .action(listAgents);

program.parse(); 