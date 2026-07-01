FROM node:20-alpine

WORKDIR /app

# Instalar dependências
COPY package*.json ./
RUN npm install

# Copiar os arquivos da aplicação
COPY . .

# Gerar o Prisma Client (importante executar antes do build)
RUN npx prisma generate

# Fazer a compilação do TypeScript para a pasta dist
RUN npm run build

# Expor porta usada no serviço
EXPOSE 3333

# Comando para iniciar o backend
CMD ["npm", "start"]
