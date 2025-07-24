# Dockerfile for Asset Tokenization Kit Artifacts
# Contains ABIs and Genesis files for deployment as init container
FROM alpine:3.22.1

# Install basic utilities for copying files
RUN apk add --no-cache \
    ca-certificates \
    tzdata

# Create directories for artifacts
RUN mkdir -p /artifacts/abis /artifacts/genesis

# Copy ABIs from the generated portal directory
COPY ../contracts/.generated/portal/ /artifacts/abis/

# Copy genesis file
COPY ../contracts/.generated/genesis.json /artifacts/genesis/

# Set proper permissions
RUN chmod -R 755 /artifacts

# Use a non-root user for security
RUN addgroup -g 1001 artifacts && \
    adduser -D -u 1001 -G artifacts artifacts && \
    chown -R artifacts:artifacts /artifacts

USER artifacts

# Set working directory
WORKDIR /artifacts

# Health check to ensure artifacts are present
HEALTHCHECK --interval=10s --timeout=3s --start-period=5s --retries=3 \
    CMD [ -d "/artifacts/abis" ] && [ -f "/artifacts/genesis/genesis.json" ] || exit 1

# Default command - just sleep to keep container alive for init container usage
CMD ["sleep", "infinity"]