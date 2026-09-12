FROM oven/bun:1-alpine

WORKDIR /app

RUN apk add --no-cache openssl

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY . .

ENV NODE_ENV=production
ENV DATABASE_URL=postgresql://placeholder:placeholder@localhost:5432/placeholder

RUN bunx prisma generate

RUN chown -R bun:bun /app
USER bun

EXPOSE 3000

CMD ["sh", "-c", "bunx prisma migrate deploy && bun src/server.ts"]
