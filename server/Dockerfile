FROM node:14.15-alpine

WORKDIR /usr/local/server
COPY package.json package-lock.json tsconfig.json ./
RUN npm ci && npm install -g tscpaths
COPY --from=epidemics-engine /usr/local/engine/dist ../engine/dist
COPY src ./src/
RUN npm run build:prod

CMD [ "node",  "./dist/index.js" ]

EXPOSE 3333/tcp