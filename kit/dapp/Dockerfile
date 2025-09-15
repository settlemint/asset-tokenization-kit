FROM oven/bun:1.2.22-slim
WORKDIR /usr/src/app

COPY .output/ /usr/src/app
COPY drizzle/ /usr/src/app/drizzle

EXPOSE 3000/tcp
ENV NODE_ENV=production
USER bun
ENTRYPOINT [ "bun", "run", "server/index.mjs" ]