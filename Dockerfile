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



FROM node:22.10.0-alpine
LABEL org.opencontainers.image.source="https://github.com/settlemint/starterkit-asset-tokenization"

ENV NEXT_TELEMETRY_DISABLED=1

ENV BUN_INSTALL="/home/node/.bun"
ENV PATH="$BUN_INSTALL/bin:$PATH"

COPY package.json bun.lockb ./
RUN apk add --no-cache curl libc6-compat bash && \
    curl -fsSL https://bun.sh/install | bash && \
    bun install --frozen-lockfile && \
    rm -rf /var/cache/apk/*

COPY . .

ENV PORT=3000
ENV HOSTNAME=0.0.0.0


CMD ["bunx", "next", "start"]