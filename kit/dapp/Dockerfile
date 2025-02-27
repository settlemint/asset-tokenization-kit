# BUILD DEPENDENCIES
FROM oven/bun:1.2.4 AS deps

RUN apt-get update && \
  apt-get install -y --no-install-recommends \
  build-essential \
  python3

COPY package.json .
COPY bun.l* .
RUN bun install

# BUILD
FROM deps AS build

ENV NEXT_TELEMETRY_DISABLED=1

COPY . .
RUN bun run build
RUN rm -Rf .next/standalone/.env
RUN ls -alh .next/

# RUN
FROM oven/bun:1.2.4

LABEL org.opencontainers.image.source="https://github.com/settlemint/starterkit-asset-tokenization"

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=build --chmod=0777  /home/bun/app/public public
COPY --from=build --chmod=0777  /home/bun/app/.next/standalone ./
COPY --from=build --chmod=0777  /home/bun/app/.next/static ./.next/static

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["bun", "server.js"]