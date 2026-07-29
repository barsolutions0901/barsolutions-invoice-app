FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY prisma ./prisma
COPY public ./public
COPY src ./src
COPY scripts ./scripts

RUN npx prisma generate && npx prisma migrate deploy 2>/dev/null || true

EXPOSE 3000

CMD ["node", "src/server.js"]
