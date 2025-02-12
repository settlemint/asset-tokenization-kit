FROM node:22.13.1 AS build

COPY --from=oven/bun:1.2.2-debian --chmod=0777 /usr/local/bin/bun /bin/bun
ENV BUN_RUNTIME_TRANSPILER_CACHE_PATH=0
ENV BUN_INSTALL_BIN=/bin

RUN --mount=type=cache,sharing=locked,target=/var/cache/apt \
  export DEBIAN_FRONTEND=noninteractive && \
  apt-get update && \
  apt-get install -y --no-install-recommends make build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev && \
  apt-get clean && \
  rm -rf /var/lib/apt/lists/* /var/cache/debconf/templates.dat* /var/lib/dpkg/status* /var/log/dpkg.log /var/log/apt/*.log

ENV FOUNDRY_DIR=/usr/local
RUN curl -L https://foundry.paradigm.xyz | bash && \
  /usr/local/bin/foundryup

WORKDIR /

COPY . /usecase

WORKDIR /usecase

USER root

RUN bun install
RUN mkdir -p /root/.svm

FROM busybox:1.37.0
LABEL org.opencontainers.image.source="https://github.com/settlemint/starterkit-asset-tokenization"

COPY --from=build /usecase /usecase
COPY --from=build /root/.svm /usecase-svm
COPY --from=build /root/.cache /usecase-cache