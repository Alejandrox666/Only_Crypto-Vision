FROM node:18-alpine
WORKDIR /usr/src/app

# 1. Copia solo lo necesario para instalar dependencias
COPY package.json package-lock.json ./

# 2. Instala dependencias de producción
RUN npm ci --only=production

# 3. Copia el resto del código
COPY . .

EXPOSE 3001
CMD ["node", "server.js"]