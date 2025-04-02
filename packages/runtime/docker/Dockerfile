FROM node:18-alpine

WORKDIR /app

# Install system dependencies
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN npm install -g pnpm && \
    pnpm install --frozen-lockfile

# Copy application files
COPY . .

# Build application
RUN pnpm run build

# Set environment variables
ENV NODE_ENV=production

# Start agent
CMD ["node", "dist/index.js"] 