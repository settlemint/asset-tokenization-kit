# If you build like this, the config variables are compiled into the build, and this prevents you from using env vars in the Custom Deployments
# FROM node:22.10.0-alpine
# LABEL org.opencontainers.image.source="https://github.com/settlemint/starterkit-asset-tokenization"

# ENV NEXT_TELEMETRY_DISABLED=1

# COPY ./public public
# COPY ./.next/standalone ./
# COPY ./.next/static ./.next/static

# ENV PORT=3000
# ENV HOSTNAME=0.0.0.0

# # Bun fails with The Request.signal getter can only be used on instances of Request
# #CMD ["/usr/local/bin/bun", "run", "server.js"]
# CMD ["node", "server.js"]



FROM node:22.10.0-slim
LABEL org.opencontainers.image.source="https://github.com/settlemint/starterkit-asset-tokenization"

COPY --from=oven/bun:1.1.33 --chmod=0777 /usr/local/bin/bun /bin/bun

ENV BUN_RUNTIME_TRANSPILER_CACHE_PATH=0
ENV BUN_INSTALL_BIN=/bin
ENV NEXT_TELEMETRY_DISABLED=1

COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile
COPY . .

ENV PORT=3000
ENV HOSTNAME=0.0.0.0


CMD ["bun", "run", "start"]
