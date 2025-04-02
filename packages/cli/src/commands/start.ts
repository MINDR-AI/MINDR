import { Runtime } from '@mindr/runtime';
import { RuntimeOptions } from '../types';
import ora from 'ora';

export async function startAgent(name: string, options: RuntimeOptions): Promise<void> {
  const spinner = ora('Starting agent...').start();

  try {
    const runtime = new Runtime();
    
    // Load agent configuration
    const config = await import(process.cwd() + '/src/config');
    
    // Override runtime options if provided
    if (options.memory) config.runtime.memory = options.memory;
    if (options.storage) config.runtime.storage = options.storage;
    if (options.cpu) config.runtime.cpu = options.cpu;
    if (options.timeout) config.runtime.timeout = options.timeout;

    // Start agent container
    await runtime.startAgent(name, config);

    spinner.succeed(`Agent ${name} started successfully`);

    // Monitor agent events
    runtime.on('agent:log', (log) => {
      console.log(`[${name}] ${log}`);
    });

    runtime.on('agent:error', (error) => {
      console.error(`[${name}] Error: ${error}`);
    });

    runtime.on('agent:stop', () => {
      console.log(`[${name}] Agent stopped`);
      process.exit(0);
    });

    // Handle process termination
    process.on('SIGINT', async () => {
      spinner.start('Stopping agent...');
      await runtime.stopAgent(name);
      spinner.succeed('Agent stopped successfully');
      process.exit(0);
    });

  } catch (error) {
    spinner.fail(`Failed to start agent: ${error}`);
    throw error;
  }
} 