# Stage 0, "build-stage", basado en Node.js, para construir y compilar en frontend
FROM node:20-alpine AS build-stage
WORKDIR /app
COPY package*.json /app/

RUN apk add --no-cache python3 make g++ # Fix error for python
RUN npm cache clean --force
RUN rm -rf node_modules package-lock.json
RUN npm install --progress=false
RUN npm link @angular/cli@18.2.0

COPY ./ /app/

ARG environment
ENV configuration=$environment

RUN npm run build -- --output-path=./dist/out --configuration $configuration --optimization

# Stage 1, basado en Nginx, tener solo la aplicación compilada, lista para producción con Nginx
FROM nginxinc/nginx-unprivileged
COPY --from=build-stage /app/dist/out/ /usr/share/nginx/html
COPY ./nginx-custom.conf /etc/nginx/conf.d/default.conf
