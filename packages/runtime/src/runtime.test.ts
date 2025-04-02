import { Runtime } from './runtime';
import { exampleConfig } from './config.example';
import { AgentConfig } from '@mindr/core';

describe('Runtime', () => {
  let runtime: Runtime;

  beforeEach(() => {
    runtime = new Runtime(exampleConfig);
  });

  afterEach(async () => {
    // Clean up any running containers
    const containers = await runtime['docker'].listContainers();
    for (const container of containers) {
      if (container.Names[0].startsWith('/mindr-agent-')) {
        const containerId = container.Id;
        const containerInstance = runtime['docker'].getContainer(containerId);
        await containerInstance.stop();
        await containerInstance.remove();
      }
    }
  });

  const testAgentConfig: AgentConfig = {
    id: 'test-agent',
    name: 'Test Agent',
    description: 'Test agent for runtime tests',
    version: '1.0.0',
    capabilities: ['test'],
    runtime: {
      memory: 256 * 1024 * 1024, // 256MB
      storage: 512 * 1024 * 1024, // 512MB
      cpu: 0.5,
      timeout: 30000
    }
  };

  describe('startAgent', () => {
    it('should start a new agent container', async () => {
      const status = await runtime.startAgent(testAgentConfig);
      expect(status).toBeDefined();
      expect(status.agentId).toBe(testAgentConfig.id);
      expect(status.state).toBe('running');
    });

    it('should emit container events', async () => {
      const events: string[] = [];
      runtime.on('container.created', () => events.push('created'));
      runtime.on('container.started', () => events.push('started'));

      await runtime.startAgent(testAgentConfig);

      expect(events).toContain('created');
      expect(events).toContain('started');
    });
  });

  describe('stopAgent', () => {
    it('should stop a running agent container', async () => {
      const status = await runtime.startAgent(testAgentConfig);
      await runtime.stopAgent(testAgentConfig.id);

      const finalStatus = runtime.getStatus(testAgentConfig.id);
      expect(finalStatus).toBeUndefined();
    });

    it('should throw error for non-existent agent', async () => {
      await expect(runtime.stopAgent('non-existent')).rejects.toThrow();
    });
  });

  describe('resource monitoring', () => {
    it('should monitor container resource usage', async () => {
      const status = await runtime.startAgent(testAgentConfig);
      
      // Wait for monitoring to update
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const updatedStatus = runtime.getStatus(testAgentConfig.id);
      expect(updatedStatus?.resourceUsage.memoryUsed).toBeGreaterThan(0);
      expect(updatedStatus?.resourceUsage.cpuUsage).toBeGreaterThanOrEqual(0);
    });

    it('should stop container when resource limits exceeded', async () => {
      const highMemoryConfig: AgentConfig = {
        ...testAgentConfig,
        runtime: {
          ...testAgentConfig.runtime,
          memory: exampleConfig.resourceLimits.memory * 2
        }
      };

      const status = await runtime.startAgent(highMemoryConfig);
      
      // Wait for monitoring to detect limit breach
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const finalStatus = runtime.getStatus(highMemoryConfig.id);
      expect(finalStatus?.state).toBe('stopped');
    });
  });
}); 