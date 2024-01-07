# Use an official Node runtime as a parent image
FROM node:21.5.0

# Set the working directory to /app
WORKDIR /app

# Copy package.json and package-lock.json to the container
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the current directory contents into the container at /app
COPY . .

# Make port 3000 available to the world outside this container
EXPOSE 3000

# Define environment variable
ENV REACT_APP_API_URL http://localhost:5000

# Run the app
CMD ["npm", "start"]