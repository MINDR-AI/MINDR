import { Runtime } from '@mindr/runtime';
import { RuntimeOptions } from '../types';
import ora from 'ora';

export async function stopAgent(name: string, options: RuntimeOptions): Promise<void> {
  const spinner = ora('Stopping agent...').start();

  try {
    const runtime = new Runtime();
    
    // Stop agent container
    await runtime.stopAgent(name, { force: options.force });

    spinner.succeed(`Agent ${name} stopped successfully`);
  } catch (error) {
    spinner.fail(`Failed to stop agent: ${error}`);
    throw error;
  }
} 