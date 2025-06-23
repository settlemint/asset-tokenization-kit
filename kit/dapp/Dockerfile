FROM oven/bun:1.2.17 AS base
WORKDIR /usr/src/app

COPY .output/ /usr/src/app
RUN cd /usr/src/app/server && bun install --frozen-lockfile

EXPOSE 3000/tcp
ENV NODE_ENV=production
USER bun
ENTRYPOINT [ "bun", "run", "server/index.ts" ]