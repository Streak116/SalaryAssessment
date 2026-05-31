FROM node:20-slim

WORKDIR /app

# Copy data folder containing first/last names needed for database seeding
COPY data/ /app/data/

# Setup backend workspace
WORKDIR /app/backend

# Copy package and prisma configs
COPY backend/package*.json ./
COPY backend/prisma ./prisma/

# Install system build dependencies for native modules (like better-sqlite3)
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

# Install all dependencies and build Prisma Client
RUN npm install --legacy-peer-deps
RUN npx prisma generate

# Copy backend source files
COPY backend/ ./

# Compile TypeScript
RUN npm run build

EXPOSE 3001

# Execute migrations, run seeder, and launch server
CMD npx prisma db push && npm run start
