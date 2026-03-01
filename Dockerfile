ARG NODE_VERSION=20-alpine

########################
# Stage: deps + build  #
########################
FROM node:${NODE_VERSION} AS builder
WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci --no-audit --no-fund

COPY . .

RUN npm run build

########################
# Stage: runtime       #
########################
FROM node:${NODE_VERSION} AS runner
WORKDIR /app

#vite serve a runtime
#ENV NODE_ENV=production

RUN apk add --no-cache tini

COPY --chown=node:node package.json package-lock.json ./

#non posso usare --omit=dev per compa di un import di vite, va sistemato
RUN npm ci --no-audit --no-fund \
    && npm cache clean --force

COPY --from=builder --chown=node:node /app/dist ./dist

USER node
EXPOSE 5000
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["npm", "start"]