FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --production

# Copy compiled backend
COPY dist ./dist
COPY src/db ./dist/db

# Create .env file with defaults
RUN echo "PORT=5000\n\
NODE_ENV=production\n\
DB_HOST=postgres\n\
DB_PORT=5432\n\
DB_USER=postgres\n\
DB_PASSWORD=postgres\n\
DB_NAME=executive_meeting_suite\n\
JWT_SECRET=your-super-secret-key-change-this-in-production" > .env

EXPOSE 5000

CMD ["node", "dist/server.js"]
