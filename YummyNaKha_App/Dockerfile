# The YummyNaKha! web app (Next.js + Prisma). Built and run by docker-compose.yml.
FROM node:22-bookworm-slim AS build
WORKDIR /app
COPY package.json package-lock.json prisma.config.ts ./
COPY prisma ./prisma
# Also runs `prisma generate` (postinstall).
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-bookworm-slim
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app ./
EXPOSE 3000
# Apply any new database migrations, then start the app.
CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]
