ARG NODE_VERSION=20-alpine

########################
# Stage: deps + build  #
########################
FROM node:${NODE_VERSION} AS builder
WORKDIR /app

COPY package.json package-lock.json ./

RUN --mount=type=cache,target=/root/.npm \
    npm ci --no-audit --no-fund

COPY . .

RUN npm run build

########################
# Stage: runtime       #
########################
FROM node:${NODE_VERSION} AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN apk add --no-cache tini

COPY --chown=node:node package.json package-lock.json ./

RUN --mount=type=cache,target=/root/.npm \
    npm ci --omit=dev --no-audit --no-fund \
    && npm cache clean --force

COPY --from=builder --chown=node:node /app/dist ./dist

USER node
EXPOSE 5000
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["npm", "start"]