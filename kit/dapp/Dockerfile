FROM oven/bun:1.2.18 AS base
WORKDIR /usr/src/app

COPY .output/ /usr/src/app

EXPOSE 3000/tcp
ENV NODE_ENV=production
USER bun
ENTRYPOINT [ "bun", "run", "server/index.mjs" ]