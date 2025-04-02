import { AgentConfig } from './types';

/**
 * Example agent configuration
 */
export const exampleConfig: AgentConfig = {
  id: 'example-agent',
  name: 'Example Agent',
  description: 'A simple example agent configuration',
  version: '1.0.0',
  capabilities: ['basic', 'storage'],
  runtime: {
    memory: 512 * 1024 * 1024, // 512MB
    storage: 1024 * 1024 * 1024, // 1GB
    cpu: 1, // 1 CPU core
    timeout: 30000 // 30 seconds
  }
}; 