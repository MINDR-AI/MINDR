import { RuntimeConfig } from './types';

/**
 * Example runtime configuration
 */
export const exampleConfig: RuntimeConfig = {
  dockerEndpoint: 'unix:///var/run/docker.sock',
  maxContainers: 10,
  defaultTimeout: 30000,
  resourceLimits: {
    memory: 512 * 1024 * 1024, // 512MB
    cpu: 1, // 1 CPU core
    storage: 1024 * 1024 * 1024, // 1GB
    network: {
      inbound: 10 * 1024 * 1024, // 10MB/s
      outbound: 10 * 1024 * 1024 // 10MB/s
    }
  }
}; 