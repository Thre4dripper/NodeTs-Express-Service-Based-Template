# Use the official Node.js v20 image
FROM node:20

# Create app directory
WORKDIR /usr/src/app

# Install nodemon and ts-node globally
RUN npm install -g nodemon ts-node

# Copy source files
COPY . .

# Install app dependencies
RUN npm install

# Build the application
RUN npm run build

# Expose the port the app runs on
EXPOSE 3000

# Define the command to run the application
CMD ["npm", "start"]