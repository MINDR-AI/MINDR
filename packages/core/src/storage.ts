import { create } from 'ipfs-http-client';
import { StorageProvider } from './types';

/**
 * IPFS-based storage provider implementation
 */
export class IPFSStorage implements StorageProvider {
  private client: any;

  constructor(endpoint: string) {
    this.client = create({ url: endpoint });
  }

  /**
   * Get value by key from IPFS
   */
  public async get(key: string): Promise<any> {
    try {
      const cid = await this.client.dag.resolve(key);
      const result = await this.client.dag.get(cid);
      return result.value;
    } catch (error) {
      throw new Error(`Failed to get value for key ${key}: ${error}`);
    }
  }

  /**
   * Store value in IPFS and return CID
   */
  public async set(key: string, value: any): Promise<void> {
    try {
      const result = await this.client.dag.put(value);
      await this.client.name.publish(result.cid);
    } catch (error) {
      throw new Error(`Failed to set value for key ${key}: ${error}`);
    }
  }

  /**
   * Delete value from IPFS
   */
  public async delete(key: string): Promise<void> {
    try {
      await this.client.pin.rm(key);
    } catch (error) {
      throw new Error(`Failed to delete key ${key}: ${error}`);
    }
  }

  /**
   * List all stored keys
   */
  public async list(): Promise<string[]> {
    try {
      const pins = await this.client.pin.ls();
      return pins.map((pin: any) => pin.cid.toString());
    } catch (error) {
      throw new Error(`Failed to list keys: ${error}`);
    }
  }
}

/**
 * In-memory storage provider for testing
 */
export class MemoryStorage implements StorageProvider {
  private storage: Map<string, any>;

  constructor() {
    this.storage = new Map();
  }

  public async get(key: string): Promise<any> {
    return this.storage.get(key);
  }

  public async set(key: string, value: any): Promise<void> {
    this.storage.set(key, value);
  }

  public async delete(key: string): Promise<void> {
    this.storage.delete(key);
  }

  public async list(): Promise<string[]> {
    return Array.from(this.storage.keys());
  }
} 