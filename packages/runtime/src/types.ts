import { AgentConfig } from '@mindr/core';

/**
 * Runtime environment configuration
 */
export interface RuntimeConfig {
  dockerEndpoint?: string;
  maxContainers?: number;
  defaultTimeout?: number;
  resourceLimits: ResourceLimits;
}

/**
 * Resource limits for containers
 */
export interface ResourceLimits {
  memory: number;
  cpu: number;
  storage: number;
  network: NetworkLimits;
}

/**
 * Network bandwidth limits
 */
export interface NetworkLimits {
  inbound: number;
  outbound: number;
}

/**
 * Container status information
 */
export interface ContainerStatus {
  id: string;
  agentId: string;
  state: 'created' | 'running' | 'paused' | 'stopped' | 'failed';
  startTime: number;
  resourceUsage: ResourceUsage;
}

/**
 * Resource usage metrics
 */
export interface ResourceUsage {
  memoryUsed: number;
  cpuUsage: number;
  storageUsed: number;
  networkUsage: {
    bytesIn: number;
    bytesOut: number;
  };
}

/**
 * Runtime events
 */
export enum RuntimeEvent {
  CONTAINER_CREATED = 'container.created',
  CONTAINER_STARTED = 'container.started',
  CONTAINER_STOPPED = 'container.stopped',
  CONTAINER_FAILED = 'container.failed',
  RESOURCE_LIMIT_EXCEEDED = 'resource.limit.exceeded'
} 