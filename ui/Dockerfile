# Build Angular application
FROM node:14.15-alpine AS build-ui

WORKDIR /usr/local/app
COPY package.json package-lock.json ./ui/
RUN cd ui && npm ci && npm install -g @angular/cli@11.0.1 && cd ../
COPY --from=epidemics-engine /usr/local/engine/dist ./engine/dist
COPY . ./ui
RUN cd ./ui && ng build --configuration production

# Copy Angular application in nginx container
FROM nginx:stable

WORKDIR /usr/share/nginx/html
RUN rm /etc/nginx/conf.d/default.conf
COPY ./server-conf/ng-nginx.conf /etc/nginx/conf.d
COPY --from=build-ui /usr/local/app/ui/dist/epidemics .

EXPOSE 8080/tcp