import * as fs from 'fs/promises';
import * as path from 'path';
import inquirer from 'inquirer';
import ora from 'ora';

interface CreateOptions {
  template: string;
}

export async function createAgent(name: string, options: CreateOptions): Promise<void> {
  const spinner = ora('Creating new agent project...').start();

  try {
    // Create project directory
    await fs.mkdir(name);

    // Ask for project details
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'description',
        message: 'Project description:',
        default: 'A MINDR agent project'
      },
      {
        type: 'list',
        name: 'capabilities',
        message: 'Select agent capabilities:',
        choices: ['basic', 'chat', 'memory', 'storage'],
        default: ['basic']
      }
    ]);

    // Create package.json
    const packageJson = {
      name: `@mindr/agent-${name}`,
      version: '0.1.0',
      description: answers.description,
      private: true,
      scripts: {
        build: 'tsc',
        dev: 'ts-node-dev --respawn src/index.ts',
        start: 'node dist/index.js',
        test: 'jest'
      },
      dependencies: {
        '@mindr/core': 'workspace:*',
        '@types/node': '^20.11.24',
        'typescript': '^5.3.3'
      },
      devDependencies: {
        '@types/jest': '^29.5.12',
        'jest': '^29.7.0',
        'ts-jest': '^29.1.2',
        'ts-node-dev': '^2.0.0'
      }
    };

    await fs.writeFile(
      path.join(name, 'package.json'),
      JSON.stringify(packageJson, null, 2)
    );

    // Create tsconfig.json
    const tsConfig = {
      compilerOptions: {
        target: 'es2020',
        module: 'commonjs',
        declaration: true,
        outDir: './dist',
        strict: true,
        esModuleInterop: true,
        skipLibCheck: true,
        forceConsistentCasingInFileNames: true
      },
      include: ['src/**/*'],
      exclude: ['node_modules', 'dist']
    };

    await fs.writeFile(
      path.join(name, 'tsconfig.json'),
      JSON.stringify(tsConfig, null, 2)
    );

    // Create source directory
    await fs.mkdir(path.join(name, 'src'));

    // Create agent configuration
    const agentConfig = {
      id: name,
      name: name,
      description: answers.description,
      version: '0.1.0',
      capabilities: answers.capabilities,
      runtime: {
        memory: 256 * 1024 * 1024,
        storage: 512 * 1024 * 1024,
        cpu: 1,
        timeout: 30000
      }
    };

    await fs.writeFile(
      path.join(name, 'src', 'config.ts'),
      `import { AgentConfig } from '@mindr/core';\n\n` +
      `export const config: AgentConfig = ${JSON.stringify(agentConfig, null, 2)};\n`
    );

    // Create main agent file
    const agentCode = `import { Agent } from '@mindr/core';
import { config } from './config';

export class ${name}Agent extends Agent {
  async init(): Promise<void> {
    await super.init();
    console.log('Agent initialized!');
  }

  async processMessage(message: string): Promise<string> {
    return \`Received: \${message}\`;
  }
}

async function main() {
  const agent = new ${name}Agent(config);
  await agent.init();
}

main().catch(console.error);
`;

    await fs.writeFile(path.join(name, 'src', 'index.ts'), agentCode);

    // Create README.md
    const readme = `# ${name}

${answers.description}

## Getting Started

\`\`\`bash
# Install dependencies
pnpm install

# Start development
pnpm dev

# Build for production
pnpm build

# Run tests
pnpm test
\`\`\`
`;

    await fs.writeFile(path.join(name, 'README.md'), readme);

    spinner.succeed(`Created new agent project: ${name}`);
  } catch (error) {
    spinner.fail(`Failed to create agent project: ${error}`);
    throw error;
  }
} 