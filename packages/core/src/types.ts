/**
 * Agent configuration interface
 */
export interface AgentConfig {
  id: string;
  name: string;
  description?: string;
  version: string;
  capabilities: string[];
  runtime: RuntimeConfig;
}

/**
 * Runtime configuration interface
 */
export interface RuntimeConfig {
  memory: number;
  storage: number;
  cpu: number;
  timeout: number;
}

/**
 * Network node interface
 */
export interface NetworkNode {
  id: string;
  endpoint: string;
  capabilities: string[];
  resources: ResourceMetrics;
}

/**
 * Resource metrics interface
 */
export interface ResourceMetrics {
  memoryTotal: number;
  memoryUsed: number;
  cpuUsage: number;
  storageTotal: number;
  storageUsed: number;
  bandwidth: number;
}

/**
 * Agent state interface
 */
export interface AgentState {
  id: string;
  memory: Record<string, any>;
  storage: Record<string, any>;
  lastUpdate: number;
}

/**
 * Storage provider interface
 */
export interface StorageProvider {
  get(key: string): Promise<any>;
  set(key: string, value: any): Promise<void>;
  delete(key: string): Promise<void>;
  list(): Promise<string[]>;
} 