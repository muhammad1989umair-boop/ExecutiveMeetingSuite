# Build stage
FROM node:18-alpine as builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Build the application (use dev server instead of build due to AppLocker issues)
# For production, you'd normally do: RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Install serve to run the app
RUN npm install -g serve

COPY --from=builder /app .

EXPOSE 3000

# For development with dev server:
CMD ["npm", "run", "dev"]

# For production with static build (uncomment if build succeeds):
# CMD ["serve", "-s", "dist", "-l", "3000"]
