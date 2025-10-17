#!/bin/bash -x
set -euo pipefail
mc alias set provisioning http://minio:9000 "${MINIO_ROOT_USER}" "${MINIO_ROOT_PASSWORD}"
mc mb --ignore-existing provisioning/atk
mc anonymous set download provisioning/atk

# Create service account if it doesn't exist
if ! mc admin user svcacct info provisioning atk-service >/dev/null 2>&1; then
    mc admin user svcacct add provisioning "${MINIO_ROOT_USER}" --access-key "${MINIO_SERVICE_ACCESS_KEY:-atk-service}" --secret-key "${MINIO_SERVICE_SECRET:-atk-service-secret}"
fi

# Keep container running by sleeping forever
# This prevents docker compose --wait from failing when the container exits
exec sleep infinity
