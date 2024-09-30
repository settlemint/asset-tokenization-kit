# DEPENDENCIES
FROM oven/bun:1.1.29 AS dependencies

COPY package.json .
RUN bun install

# BUILD
FROM dependencies as build

ENV NEXT_TELEMETRY_DISABLED 1

COPY . .
RUN bun run build

# RUNTIME
FROM oven/bun:1.1.29
LABEL org.opencontainers.image.source="https://github.com/settlemint/starterkit-asset-tokenization"

ENV NEXT_TELEMETRY_DISABLED 1

COPY --from=build --chmod=0777 /home/bun/app/public public
COPY --from=build --chmod=0777 /home/bun/app/.next/standalone ./
COPY --from=build --chmod=0777 /home/bun/app/.next/static ./.next/static

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["/usr/local/bin/bun", "run", "server.js"]
