FROM node:24.4.1-alpine

LABEL org.opencontainers.image.source="https://github.com/settlemint/asset-tokenization-kit"

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

COPY --chmod=0777 .next/standalone ./
COPY --chmod=0777 public ./kit/dapp/public
COPY --chmod=0777 .next/static ./kit/dapp/.next/static

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV NODE_ENV=production

CMD ["node", "kit/dapp/server.js"]