FROM node:20-alpine

WORKDIR /app

# Copy dependency configs first to leverage Docker caching
COPY package.json package-lock.json* ./

RUN npm install

# Copy the rest of the application files
COPY . .

EXPOSE 3000

CMD ["npm", "start"]
