# Fase de construcción
FROM node:18-alpine as builder
WORKDIR /usr/src/app

COPY package.json package-lock.json ./
RUN npm ci  # Usa npm ci para instalación reproducible

COPY src ./src
COPY public ./public
RUN npm run build

# Fase de producción
FROM nginx:alpine
COPY --from=builder /usr/src/app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80