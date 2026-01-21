FROM node:18-alpine

# Crear directorio de la aplicación
WORKDIR /app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar dependencias
RUN npm install --production

# Copiar el código fuente
COPY . .

# Exponer puerto
EXPOSE 8081

# Comando de inicio
CMD ["node", "src/index.js"]
