FROM node:22.15.0-alpine3.21

# DEPENDENCIES
FROM base AS dependencies

COPY package.json .
COPY bun.lock .
RUN bun install --frozen-lockfile

# BUILD
FROM dependencies AS build

COPY . .
ENV NODE_ENV=production
RUN bun build \
  --compile \
  --minify \
  --target bun \
  --sourcemap \
  src/api-server.ts \
  --outfile ./api-server

# RUNTIME
FROM base
LABEL org.opencontainers.image.source="https://github.com/settlemint/asset-tokenization-kit"

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=build --chmod=0777 /home/bun/app/api-server .
COPY --chmod=0777 .next/standalone ./
COPY --chmod=0777 public ./kit/dapp/public
COPY --chmod=0777 .next/static ./kit/dapp/.next/static

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV NODE_ENV=production
EXPOSE 3000/tcp

CMD [ "/kit/dapp/api-server" ]
CMD ["node", "kit/dapp/server.js"]