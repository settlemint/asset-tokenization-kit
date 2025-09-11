# Dockerfile for Asset Tokenization Kit Artifacts
# Contains ABIs and Genesis files for deployment as init container
FROM busybox:1.37

# Create directories for artifacts
RUN mkdir -p /artifacts/abis /artifacts/genesis

# Copy ABIs from the generated portal directory
COPY .generated/portal/ /artifacts/abis/

# Copy genesis file only (no allocations file)
COPY .generated/genesis* /artifacts/genesis/

# Set proper permissions: 755 for directories, 644 for files
RUN find /artifacts -type d -exec chmod 755 {} + && find /artifacts -type f -exec chmod 644 {} +

# Use a non-root user for security
RUN addgroup -g 1001 artifacts && \
    adduser -D -u 1001 -G artifacts artifacts && \
    chown -R artifacts:artifacts /artifacts

USER artifacts

# Set working directory
WORKDIR /artifacts

# Default command - just sleep to keep container alive for init container usage
CMD ["sleep", "infinity"]