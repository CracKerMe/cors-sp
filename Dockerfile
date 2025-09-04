# Use an official Node.js runtime as a parent image
FROM node:20-alpine AS base

# Set the working directory in the container
WORKDIR /app

# Copy package.json and pnpm-lock.yaml to the working directory
COPY package.json pnpm-lock.yaml ./

# Install pnpm
RUN npm install -g pnpm

# ---

# Development stage
FROM base AS dev
# Install all dependencies
RUN pnpm install
# Copy the rest of the application code
COPY . .
# Default command to run tests
CMD ["pnpm", "test"]

# ---

# Production stage
FROM base AS prod
# Install only production dependencies
RUN pnpm install --prod
# Copy the rest of the application code
COPY . .
# Expose the port the app runs on
EXPOSE 4399
# Command to run the application
CMD ["node", "src/server.js"]
