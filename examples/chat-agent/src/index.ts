import { Agent, AgentConfig, MemoryStorage } from '@mindr/core';
import * as dotenv from 'dotenv';

dotenv.config();

const config: AgentConfig = {
  id: 'chat-agent',
  name: 'Chat Agent',
  description: 'A simple chat agent example',
  version: '1.0.0',
  capabilities: ['chat', 'memory'],
  runtime: {
    memory: 256 * 1024 * 1024,
    storage: 512 * 1024 * 1024,
    cpu: 1,
    timeout: 30000
  }
};

class ChatAgent extends Agent {
  private conversationHistory: string[] = [];

  async init(): Promise<void> {
    await super.init();
    this.conversationHistory = await this.loadConversationHistory();
    console.log('Chat agent initialized!');
  }

  private async loadConversationHistory(): Promise<string[]> {
    const history = await this.getMemory('conversationHistory');
    return history || [];
  }

  async processMessage(message: string): Promise<string> {
    this.conversationHistory.push(`User: ${message}`);
    
    const response = await this.generateResponse(message);
    this.conversationHistory.push(`Agent: ${response}`);
    
    await this.updateMemory('conversationHistory', this.conversationHistory);
    return response;
  }

  private async generateResponse(message: string): Promise<string> {
    // Simple response generation logic
    if (message.toLowerCase().includes('hello')) {
      return 'Hello! How can I help you today?';
    }
    
    if (message.toLowerCase().includes('bye')) {
      return 'Goodbye! Have a great day!';
    }
    
    return `I received your message: "${message}". How can I assist you further?`;
  }

  async getConversationHistory(): Promise<string[]> {
    return this.conversationHistory;
  }
}

async function main() {
  const storage = new MemoryStorage();
  const agent = new ChatAgent(config, storage);
  
  await agent.init();
  
  // Example conversation
  const responses = await Promise.all([
    agent.processMessage('Hello!'),
    agent.processMessage('How are you?'),
    agent.processMessage('Bye!')
  ]);
  
  console.log('\nConversation:');
  const history = await agent.getConversationHistory();
  history.forEach(message => console.log(message));
}

main().catch(console.error); 