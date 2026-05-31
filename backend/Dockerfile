FROM node:20

WORKDIR /app

# Copy data folder containing first/last names needed for database seeding
COPY data/ /app/data/

# Setup backend workspace
WORKDIR /app/backend

# Copy package and prisma configs
COPY backend/package*.json ./
COPY backend/prisma ./prisma/

# Install all dependencies and build Prisma Client
RUN npm install
RUN npx prisma generate

# Copy backend source files
COPY backend/ ./

# Compile TypeScript
RUN npm run build

EXPOSE 3001

# Execute migrations, run seeder, and launch server
CMD npx prisma migrate deploy && npx prisma db seed && npm run start
