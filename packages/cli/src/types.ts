import { AgentConfig } from '@mindr/core';

export interface Agent {
  id: string;
  name: string;
  status: 'running' | 'stopped';
  memory: number;
  cpu: number;
  uptime?: number;
  config: AgentConfig;
}

export interface RuntimeOptions {
  memory?: number;
  storage?: number;
  cpu?: number;
  timeout?: number;
  force?: boolean;
} 