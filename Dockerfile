FROM oven/bun:1.1.29
LABEL org.opencontainers.image.source="https://github.com/settlemint/starterkit-asset-tokenization"

ENV NEXT_TELEMETRY_DISABLED=1

COPY ./public public
COPY ./.next/standalone ./
COPY ./.next/static ./.next/static

ENV PORT=3000
ENV HOSTNAME=0.0.0.0

CMD ["/usr/local/bin/bun", "run", "server.js"]
