FROM node:18-bullseye-slim  AS builder

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci

COPY . .

RUN npm run build

FROM node:20-alpine
WORKDIR /app

RUN apk add --no-cache dumb-init

COPY package.json package-lock.json ./

RUN npm ci --only=production && \
    npm cache clean --force

COPY --from=builder /app/dist ./dist

RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

USER nodejs

EXPOSE 5000

ENTRYPOINT ["dumb-init", "--"]

CMD ["npm", "start"]