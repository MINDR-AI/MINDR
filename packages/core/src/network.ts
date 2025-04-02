import { NetworkNode, ResourceMetrics } from './types';
import { EventEmitter } from 'events';

/**
 * Network manager for handling node discovery and communication
 */
export class NetworkManager extends EventEmitter {
  private nodes: Map<string, NetworkNode>;
  private endpoint: string;

  constructor(endpoint: string) {
    super();
    this.nodes = new Map();
    this.endpoint = endpoint;
  }

  /**
   * Register a new node in the network
   */
  public async registerNode(node: NetworkNode): Promise<void> {
    this.nodes.set(node.id, node);
    this.emit('node-registered', node);
  }

  /**
   * Remove a node from the network
   */
  public async removeNode(nodeId: string): Promise<void> {
    if (this.nodes.has(nodeId)) {
      this.nodes.delete(nodeId);
      this.emit('node-removed', nodeId);
    }
  }

  /**
   * Get all registered nodes
   */
  public getNodes(): NetworkNode[] {
    return Array.from(this.nodes.values());
  }

  /**
   * Find nodes with specific capabilities
   */
  public findNodes(capabilities: string[]): NetworkNode[] {
    return this.getNodes().filter(node => 
      capabilities.every(cap => node.capabilities.includes(cap))
    );
  }

  /**
   * Update node resource metrics
   */
  public async updateNodeMetrics(nodeId: string, metrics: ResourceMetrics): Promise<void> {
    const node = this.nodes.get(nodeId);
    if (node) {
      node.resources = metrics;
      this.emit('node-metrics-updated', nodeId, metrics);
    }
  }

  /**
   * Get node by ID
   */
  public getNode(nodeId: string): NetworkNode | undefined {
    return this.nodes.get(nodeId);
  }

  /**
   * Check if node exists
   */
  public hasNode(nodeId: string): boolean {
    return this.nodes.has(nodeId);
  }
} 