# Stage 1: Build the application
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package files first to leverage Docker cache
COPY package*.json ./
RUN npm ci

# Copy the rest of the application source
COPY . ./
RUN npm run build

# Stage 2: Production environment
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy built assets and production dependencies
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist 
# Note: Change './dist' to './build' or whatever your framework outputs

EXPOSE 3000
CMD ["npm", "start"]
