FROM node:20-slim

WORKDIR /app

RUN apt-get update && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*

COPY package.json ./
RUN npm install --include=dev

COPY main/prisma/schema.prisma ./main/prisma/
RUN npx prisma generate --schema=main/prisma/schema.prisma

COPY main/server ./main/server

EXPOSE 4000

ENV NODE_ENV=production
ENV PORT=4000

CMD node node_modules/tsx/dist/cli.mjs main/server/index.ts
