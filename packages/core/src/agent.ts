import { AgentConfig, AgentState, StorageProvider } from './types';
import { EventEmitter } from 'events';

/**
 * Base Agent class implementing core agent functionality
 */
export class Agent extends EventEmitter {
  private config: AgentConfig;
  private state: AgentState;
  private storage: StorageProvider;

  constructor(config: AgentConfig, storage: StorageProvider) {
    super();
    this.config = config;
    this.storage = storage;
    this.state = {
      id: config.id,
      memory: {},
      storage: {},
      lastUpdate: Date.now()
    };
  }

  /**
   * Initialize the agent
   */
  public async init(): Promise<void> {
    await this.loadState();
    this.emit('initialized');
  }

  /**
   * Load agent state from storage
   */
  private async loadState(): Promise<void> {
    try {
      const savedState = await this.storage.get(this.config.id);
      if (savedState) {
        this.state = savedState;
      }
    } catch (error) {
      this.emit('error', error);
    }
  }

  /**
   * Save current state to storage
   */
  public async saveState(): Promise<void> {
    try {
      this.state.lastUpdate = Date.now();
      await this.storage.set(this.config.id, this.state);
      this.emit('state-saved');
    } catch (error) {
      this.emit('error', error);
    }
  }

  /**
   * Get agent configuration
   */
  public getConfig(): AgentConfig {
    return this.config;
  }

  /**
   * Get current agent state
   */
  public getState(): AgentState {
    return this.state;
  }

  /**
   * Update agent memory
   */
  public async updateMemory(key: string, value: any): Promise<void> {
    this.state.memory[key] = value;
    await this.saveState();
  }

  /**
   * Get value from agent memory
   */
  public getMemory(key: string): any {
    return this.state.memory[key];
  }

  /**
   * Clean up agent resources
   */
  public async cleanup(): Promise<void> {
    await this.saveState();
    this.emit('cleanup');
  }
} 