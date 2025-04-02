# Getting Started with MINDR

## Prerequisites

- Node.js >= 18.0.0
- pnpm >= 8.15.0
- Git

## Installation

```bash
# Install MINDR CLI globally
npm install -g @mindr/cli

# Create a new agent project
mindr create my-agent

# Navigate to project directory
cd my-agent

# Install dependencies
pnpm install
```

## Creating Your First Agent

1. Define agent configuration:

```typescript
import { AgentConfig } from '@mindr/core';

const config: AgentConfig = {
  id: 'my-first-agent',
  name: 'My First Agent',
  description: 'A simple demonstration agent',
  version: '1.0.0',
  capabilities: ['basic'],
  runtime: {
    memory: 256 * 1024 * 1024, // 256MB
    storage: 512 * 1024 * 1024, // 512MB
    cpu: 1,
    timeout: 30000
  }
};
```

2. Implement agent behavior:

```typescript
import { Agent } from '@mindr/core';

class MyAgent extends Agent {
  async init(): Promise<void> {
    await super.init();
    console.log('Agent initialized!');
  }

  async processMessage(message: string): Promise<string> {
    return `Received: ${message}`;
  }
}
```

3. Run the agent:

```typescript
import { MemoryStorage } from '@mindr/core';

async function main() {
  const storage = new MemoryStorage();
  const agent = new MyAgent(config, storage);
  
  await agent.init();
  const response = await agent.processMessage('Hello!');
  console.log(response);
}

main().catch(console.error);
```

## Development Tools

MINDR provides several development tools to help you build and test agents:

- **MINDR Studio**: Visual development environment
- **MINDR CLI**: Command-line tools
- **MINDR Runtime**: Local development runtime
- **MINDR Guardian**: Security testing tools

## Next Steps

- Read the [Core Concepts](./core-concepts.md) guide
- Explore [API Documentation](./api/index.md)
- Check out [Example Projects](./examples/index.md)

## Support

If you need help or have questions:

- [Documentation](https://docs.mind-r.xyz)
- [GitHub Issues](https://github.com/MINDR-AI/MINDR/issues)
- [Twitter](https://x.com/MINDR_AI) 