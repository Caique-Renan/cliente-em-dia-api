# Estágio 1: Build da aplicação React/Vite
FROM node:20-alpine AS builder

WORKDIR /app

# Argumento para VITE_API_URL em tempo de build
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Instalar dependências
COPY package*.json ./
RUN npm install

# Copiar os arquivos e compilar
COPY . .
RUN npm run build

# Estágio 2: Servir os arquivos estáticos via Nginx
FROM nginx:alpine

# Remover a configuração padrão do Nginx
RUN rm -rf /usr/share/nginx/html/*

# Copiar o build do estágio anterior
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiar configuração personalizada do Nginx para lidar com rotas do React (F5 fallback)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expor a porta 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
