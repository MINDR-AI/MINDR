import { EventEmitter } from 'events';
import Docker from 'dockerode';
import { AgentConfig } from '@mindr/core';
import { RuntimeConfig, ContainerStatus, RuntimeEvent } from './types';

/**
 * Runtime environment for managing agent containers
 */
export class Runtime extends EventEmitter {
  private docker: Docker;
  private config: RuntimeConfig;
  private containers: Map<string, ContainerStatus>;

  constructor(config: RuntimeConfig) {
    super();
    this.config = config;
    this.docker = new Docker(config.dockerEndpoint ? { host: config.dockerEndpoint } : {});
    this.containers = new Map();
  }

  /**
   * Start a new agent container
   */
  public async startAgent(agentConfig: AgentConfig): Promise<ContainerStatus> {
    const container = await this.docker.createContainer({
      Image: 'mindr/agent:latest',
      name: `mindr-agent-${agentConfig.id}`,
      Env: [
        `AGENT_ID=${agentConfig.id}`,
        `AGENT_CONFIG=${JSON.stringify(agentConfig)}`
      ],
      HostConfig: {
        Memory: agentConfig.runtime.memory,
        NanoCpus: agentConfig.runtime.cpu * 1e9,
        StorageOpt: {
          size: `${agentConfig.runtime.storage}b`
        }
      }
    });

    const status: ContainerStatus = {
      id: container.id,
      agentId: agentConfig.id,
      state: 'created',
      startTime: Date.now(),
      resourceUsage: {
        memoryUsed: 0,
        cpuUsage: 0,
        storageUsed: 0,
        networkUsage: {
          bytesIn: 0,
          bytesOut: 0
        }
      }
    };

    this.containers.set(agentConfig.id, status);
    this.emit(RuntimeEvent.CONTAINER_CREATED, status);

    await container.start();
    status.state = 'running';
    this.emit(RuntimeEvent.CONTAINER_STARTED, status);

    this.monitorContainer(container, status);

    return status;
  }

  /**
   * Stop an agent container
   */
  public async stopAgent(agentId: string): Promise<void> {
    const status = this.containers.get(agentId);
    if (!status) {
      throw new Error(`Agent ${agentId} not found`);
    }

    const container = this.docker.getContainer(status.id);
    await container.stop();
    await container.remove();

    status.state = 'stopped';
    this.emit(RuntimeEvent.CONTAINER_STOPPED, status);
    this.containers.delete(agentId);
  }

  /**
   * Get container status
   */
  public getStatus(agentId: string): ContainerStatus | undefined {
    return this.containers.get(agentId);
  }

  /**
   * Monitor container resource usage
   */
  private async monitorContainer(container: Docker.Container, status: ContainerStatus): Promise<void> {
    try {
      const stats = await container.stats({ stream: false });
      
      // Update resource usage metrics
      status.resourceUsage = {
        memoryUsed: stats.memory_stats.usage,
        cpuUsage: this.calculateCPUUsage(stats),
        storageUsed: 0, // Docker doesn't provide direct storage stats
        networkUsage: {
          bytesIn: stats.networks?.eth0?.rx_bytes || 0,
          bytesOut: stats.networks?.eth0?.tx_bytes || 0
        }
      };

      // Check resource limits
      if (this.checkResourceLimits(status)) {
        this.emit(RuntimeEvent.RESOURCE_LIMIT_EXCEEDED, status);
        await this.stopAgent(status.agentId);
      }

      // Continue monitoring if container is still running
      if (status.state === 'running') {
        setTimeout(() => this.monitorContainer(container, status), 1000);
      }
    } catch (error) {
      status.state = 'failed';
      this.emit(RuntimeEvent.CONTAINER_FAILED, { status, error });
    }
  }

  /**
   * Calculate CPU usage percentage
   */
  private calculateCPUUsage(stats: any): number {
    const cpuDelta = stats.cpu_stats.cpu_usage.total_usage - stats.precpu_stats.cpu_usage.total_usage;
    const systemDelta = stats.cpu_stats.system_cpu_usage - stats.precpu_stats.system_cpu_usage;
    const cpuCount = stats.cpu_stats.online_cpus;

    return (cpuDelta / systemDelta) * cpuCount * 100;
  }

  /**
   * Check if resource limits are exceeded
   */
  private checkResourceLimits(status: ContainerStatus): boolean {
    const limits = this.config.resourceLimits;
    const usage = status.resourceUsage;

    return (
      usage.memoryUsed > limits.memory ||
      usage.cpuUsage > limits.cpu ||
      usage.storageUsed > limits.storage ||
      usage.networkUsage.bytesIn > limits.network.inbound ||
      usage.networkUsage.bytesOut > limits.network.outbound
    );
  }
} 