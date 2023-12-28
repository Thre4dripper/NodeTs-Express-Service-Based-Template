# Use the official Node.js v20 image
FROM node:20

# Create app directory
WORKDIR /app

# Install nodemon and ts-node globally
RUN npm install -g nodemon ts-node

# Copy package.json and package-lock.json
COPY package*.json ./

# Install app dependencies
RUN npm install

# Copy source files
COPY src ./src

# Build the application
RUN npm run build

# Expose the port the app runs on
EXPOSE 3000

# Define the command to run the application
CMD ["npm", "start"]