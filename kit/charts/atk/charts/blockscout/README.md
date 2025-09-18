# Blockscout Chart

This is a local implementation of the Blockscout blockchain explorer stack for the Asset Tokenization Kit, replacing the external blockscout-stack dependency.

## Components

- **Blockscout Backend**: The main Blockscout API and backend service
- **Blockscout Frontend**: The Next.js-based frontend interface

## Features

- **Security Context**: All containers run as non-root user (UID 1001) with proper security contexts
- **Pod Security**: Follows the same security patterns as other ATK charts
- **Init Containers**: Proper database migration handling
- **Health Checks**: Liveness and readiness probes configured

## Security Context

All pods and containers are configured with:
- `runAsUser: 1001`
- `runAsGroup: 1001`
- `runAsNonRoot: true`
- `allowPrivilegeEscalation: false`
- All capabilities dropped
- `fsGroup: 1001` for pod security context

## Configuration

The chart is configured via the ATK parent chart values. Key configuration includes:

### Backend Configuration
- Database connection via PostgreSQL
- RPC endpoint configuration
- Ingress configuration for backend API

### Frontend Configuration
- API connection to backend
- Network configuration
- UI customization options

## Installation

This chart is installed as a dependency of the main ATK chart and is not intended to be installed standalone.

## Values Structure

The values are structured to maintain compatibility with the original blockscout-stack chart interface while implementing our own templates with proper security contexts.