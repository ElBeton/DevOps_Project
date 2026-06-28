# syntax=docker/dockerfile:1

FROM node:20-alpine AS builder
WORKDIR /usr/src/app
COPY package.json package-lock.json* ./
RUN npm install --production
COPY . ./

FROM node:20-alpine AS runtime
WORKDIR /usr/src/app
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/server.js ./server.js
USER node
EXPOSE 3000
ENV PORT=3000
CMD ["node", "server.js"]
