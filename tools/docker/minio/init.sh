#!/bin/bash -x
set -euo pipefail
mc alias set provisioning http://minio:9000 "${MINIO_ROOT_USER}" "${MINIO_ROOT_PASSWORD}"
mc mb --ignore-existing provisioning/atk

# Create service account if it doesn't exist
if ! mc admin user svcacct info provisioning atk-service >/dev/null 2>&1; then
    mc admin user svcacct add provisioning "${MINIO_ROOT_USER}" --access-key "${MINIO_SERVICE_ACCESS_KEY:-atk-service}" --secret-key "${MINIO_SERVICE_SECRET:-atk-service-secret}"
fi

# Configure CORS for browser access to uploaded images
mc anonymous set public provisioning/atk
mc anonymous set public provisioning/branding || true

# Set CORS policy to allow browser access from localhost
mc admin config set provisioning api cors_allow_origin="http://localhost:3000,http://127.0.0.1:3000,http://localhost:3001,http://127.0.0.1:3001"
mc admin config set provisioning api cors_allow_methods="GET,POST,PUT,DELETE,HEAD,OPTIONS"
mc admin config set provisioning api cors_allow_headers="*"
mc admin config set provisioning api cors_max_age="86400"

# Restart MinIO to apply CORS settings
mc admin service restart provisioning

# Wait for MinIO to restart
sleep 5

# Keep container running by sleeping forever
# This prevents docker compose --wait from failing when the container exits
exec sleep infinity