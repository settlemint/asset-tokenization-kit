FROM node:22.11.0-alpine
LABEL org.opencontainers.image.source="https://github.com/settlemint/starterkit-asset-tokenization"

ENV NEXT_TELEMETRY_DISABLED=1

COPY ./public public
COPY ./.next/standalone ./
COPY ./.next/static ./.next/static

ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Bun fails with The Request.signal getter can only be used on instances of Request
#CMD ["/usr/local/bin/bun", "run", "server.js"]
CMD ["node", "server.js"]
