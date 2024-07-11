# Use -f flag to specify the Dockerfile when building the image manually
# Use the official Node.js v22 image
FROM node:22

# Create app directory
WORKDIR /app

# Install nodemon and ts-node globally
RUN npm install -g nodemon ts-node

# Copy package.json and yarn.lock files
COPY package*.json ./
COPY yarn.lock ./

# Install app dependencies
RUN yarn

# Copy source files
COPY . .