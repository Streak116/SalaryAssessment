FROM node:20

WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm install

COPY frontend/ ./

# Set environment variable at build-time so Next.js static pages can access the API endpoint
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Build optimized bundles
RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start"]
