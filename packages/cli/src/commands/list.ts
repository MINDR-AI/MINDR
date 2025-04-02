import { Runtime } from '@mindr/runtime';
import { Agent } from '../types';
import Table from 'cli-table3';
import ora from 'ora';

interface ListOptions {
  format?: 'table' | 'json';
  status?: Agent['status'] | 'all';
}

export async function listAgents(options: ListOptions = {}): Promise<void> {
  const spinner = ora('Fetching agents...').start();

  try {
    const runtime = new Runtime();
    const agents = await runtime.listAgents();

    // Filter agents by status if specified
    const filteredAgents = options.status && options.status !== 'all'
      ? agents.filter(agent => agent.status === options.status)
      : agents;

    if (options.format === 'json') {
      console.log(JSON.stringify(filteredAgents, null, 2));
    } else {
      // Create table
      const table = new Table({
        head: ['ID', 'Name', 'Status', 'Memory', 'CPU', 'Uptime'],
        style: {
          head: ['cyan'],
          border: ['grey']
        }
      });

      // Add rows
      filteredAgents.forEach(agent => {
        table.push([
          agent.id,
          agent.name,
          agent.status,
          `${Math.round(agent.memory / 1024 / 1024)}MB`,
          `${agent.cpu * 100}%`,
          agent.uptime ? `${Math.round(agent.uptime / 1000)}s` : '-'
        ]);
      });

      console.log(table.toString());
    }

    spinner.succeed(`Found ${filteredAgents.length} agents`);
  } catch (error) {
    spinner.fail(`Failed to list agents: ${error}`);
    throw error;
  }
} 