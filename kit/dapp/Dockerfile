FROM oven/bun:1.2.4

LABEL org.opencontainers.image.source="https://github.com/settlemint/starterkit-asset-tokenization"

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=build --chmod=0777  .next/standalone ./
COPY --from=build --chmod=0777  public ./kit/dapp/public
COPY --from=build --chmod=0777  .next/static ./kit/dapp/.next/static

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["bun", "kit/dapp/server.js"]