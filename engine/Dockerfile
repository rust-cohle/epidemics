# Build engine
FROM node:14.15-alpine

WORKDIR /usr/local/engine
COPY package.json package-lock.json tsconfig.json ./
RUN npm ci
COPY src ./src
RUN npm run build