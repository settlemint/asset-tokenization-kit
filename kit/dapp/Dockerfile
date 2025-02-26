# BUILD DEPENDENCIES
FROM node:22.14.0 AS deps
COPY --from=oven/bun:1.2.4-debian --chmod=0777 /usr/local/bin/bun /bin/bun

RUN mkdir -p /app
WORKDIR /app

COPY package.json .
COPY bun.l* .
RUN bun install
RUN bun x playwright install --with-deps

FROM deps AS build

COPY --chmod=0777 . .
RUN bun run build
RUN rm -Rf .next/standalone/.env

# RUN
FROM node:22.14.0-slim

LABEL org.opencontainers.image.source="https://github.com/settlemint/starterkit-asset-tokenization"

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=build --chmod=0777  /app/public public
COPY --from=build --chmod=0777  /app/.next/standalone ./
COPY --from=build --chmod=0777  /app/.next/static ./.next/static

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["server.js"]