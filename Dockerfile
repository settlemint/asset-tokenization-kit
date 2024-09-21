# DEPENDENCIES
FROM oven/bun:1.1.29-debian AS dependencies

COPY apps/dapp/package.json .
RUN bun install

# BUILD
FROM dependencies as build

ENV NEXT_TELEMETRY_DISABLED 1

COPY apps/dapp/ .
COPY apps/database/ ./database
RUN bun run build

# RUNTIME
FROM oven/bun:1.1.29-debian
LABEL org.opencontainers.image.source="https://github.com/settlemint/sdk"

RUN apt-get update && \
    apt-get install -yq curl && \
    curl -L https://github.com/hasura/graphql-engine/raw/stable/cli/get.sh | bash && \
    hasura update-cli && \
    apt-get remove -yq curl && \
    apt-get autoremove -yq  && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

ENV NEXT_TELEMETRY_DISABLED 1

COPY --from=build --chmod=0777 /home/bun/app/database /database
COPY --from=build --chmod=0777 /home/bun/app/public public
COPY --from=build --chmod=0777 /home/bun/app/.next/standalone ./
COPY --from=build --chmod=0777 /home/bun/app/.next/static ./.next/static

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["server.js"]
