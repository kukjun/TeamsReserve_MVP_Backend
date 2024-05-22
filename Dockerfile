# Stage 1: Build Stage
FROM node:20.12.2 AS builder

# Install pnpm globally
RUN npm install -g pnpm@9.1.1

# Set working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN pnpm install

# Copy the rest of the application code
COPY . .

# Generate Prisma schema
RUN pnpm prisma generate

# Build the application
RUN pnpm build

# Stage 2: Production Stage
FROM node:20.12.2-alpine

# Install pnpm globally
RUN npm install -g pnpm@9.1.1

# Set working directory
WORKDIR /usr/src/app

# Copy only the necessary files from the build stage
COPY --from=builder /usr/src/app/package*.json ./
COPY --from=builder /usr/src/app/pnpm-lock.yaml ./
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/dist ./dist

# Expose the application port
EXPOSE 3000

# Start the application
CMD ["node", "dist/main.js"]
