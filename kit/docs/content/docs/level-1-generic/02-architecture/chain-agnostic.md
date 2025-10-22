---
title: Chain-Agnostic Deployment
description: Deploy on any EVM chain while maintaining compliance
---

<!-- SOURCE: Book of DALP Part III/Chapter 17 — Multi‑Chain Strategy lines 1-14 -->
<!-- SOURCE: Book of DALP Part II/Chapter 5 — Deployment & White‑Label lines 1-41 -->
<!-- SOURCE: Book of DALP Part V/Appendix S — Licensing & Deployment Options -->
<!-- SOURCE: kit/contracts/README.md - Deployment section -->
<!-- EXTRACTION: Multi-chain strategy, deployment options, and white-label capabilities -->
<!-- STATUS: COPIED | POLISHED | VERIFIED -->

# Chain-Agnostic Deployment

**"Multi-chain" is often code for "law falls off at the bridge." That's unacceptable. Our approach is brutally simple: no asset moves to a domain where compliance cannot be enforced.**

## Multi-Chain Philosophy

The Asset Tokenization Kit deploys to EVM networks with compliance in the token path. Bridge operations must preserve identity continuity and enforcement semantics across the full lifecycle.

### Core Principle

Cross-chain asset movement requires more than technical bridges; it demands legal and compliance continuity. We move assets by:

1. **Locking the source token** on the originating chain
2. **Minting a mirror** on the destination network
3. **Only after verification** that the destination can enforce identical guardrails

The destination must demonstrate:
- Whitelists exist and function properly
- Rule sets load and execute correctly
- Identity resolution works reliably

If these compliance prerequisites cannot be satisfied, the minting process blocks automatically and the source token unlocks, ensuring **no compliance leakage**.

## Supported Networks

The platform maintains chain-agnostic architecture across EVM-compatible networks:

### Public Networks

- **Ethereum Mainnet**: The original smart contract platform
- **Polygon (Matic)**: High-throughput, low-cost transactions
- **Avalanche C-Chain**: Sub-second finality
- **Arbitrum One**: Ethereum L2 with lower costs
- **Optimism**: Optimistic rollup for scaling
- **Base**: Coinbase's L2 for institutional adoption
- **BSC (Binance Smart Chain)**: High performance alternative

### Private/Permissioned Networks

- **Hyperledger Besu**: Enterprise Ethereum client
- **Private Ethereum**: Custom institutional chains
- **Consortium Networks**: Multi-party private deployments
- **Regulatory Sandboxes**: Government-approved test networks

### Selection Criteria

Network selection follows practical rather than ideological criteria:

1. **Distribution Requirements**: Where are your investors?
2. **Fee Structures**: Transaction cost considerations
3. **Risk Management**: Network stability and security
4. **Regulatory Acceptance**: Jurisdiction-specific preferences

## Deployment Options

Control over infrastructure is the gating item for regulated deployments. ATK ships with battle-tested deployment options:

### 1. Self-Hosted Kubernetes

The `kit/charts/atk` Helm stack packages the entire platform:

**Components Included:**
- dApp (Next.js application)
- ORPC backend services
- Hyperledger Besu network
- Blockscout explorer
- Hasura GraphQL engine
- MinIO object storage
- Complete observability stack

**Features:**
- Environment-specific `values*.yaml` files
- Pod disruption budgets
- Network policies
- Full control over nodes, keys, and change management

### 2. Local and Development Automation

`docker-compose.yml` plus `bun run dev:up` reproduce the full platform:

**Use Cases:**
- Developer environments
- QA testing
- Sandbox demos
- Proof of concepts

The Compose stack uses the same artifacts that Helm deploys, ensuring development mirrors production.

### 3. Managed SettleMint Console

SettleMint's hosted option runs the identical stack for teams that want the platform operated for them:

**Benefits:**
- Tenant automation
- Export capabilities
- Access to Helm assets
- Option to move on-prem when needed

Console still maintains hard tenancy separation for institutional requirements.

## White-Label Capabilities

The platform ships with comprehensive white-label support:

### Brand Customization

- **Theming System**: Complete design token control
- **Brand Packs**: Pre-configured visual identities
- **Custom Domains**: Your URLs, not ours
- **UI Components**: Reusable, branded interface elements

### Technical Implementation

The Next.js application (`kit/dapp`) includes:
- Configurable theming system
- Design tokens for colors, typography, spacing
- Brand pack templates
- Component library with customization hooks

### Domain and Certificate Management

Helm ingress values support:
- Custom domains for all services
- SSL/TLS certificates
- CDN integration
- Multi-domain configurations

## Infrastructure Building Blocks

### Swappable Components

Default charts provision standard services, but you can customize:

- **Blockchain Nodes**: Switch between node implementations
- **Storage Classes**: Use your preferred storage providers
- **Cloud Primitives**: AWS, Azure, GCP native services
- **Database Systems**: PostgreSQL, MySQL, or alternatives
- **Cache Layers**: Redis, Memcached, or others

### Promotion Paths

Tooling supports environment progression:

1. **Local Development**: Docker Compose
2. **Feature Branches**: Isolated test environments
3. **Staging**: Production-like validation
4. **Production**: Full deployment with monitoring

### Observability Stack

Built-in monitoring includes:

- **Prometheus**: Metrics collection
- **Grafana**: Dashboards and visualization
- **Loki/Fluent Bit**: Log aggregation
- **Alert Manager**: Incident notification
- **Custom Dashboards**: Asset-specific views

## Identity Continuity Across Chains

Identity forms the backbone of compliant cross-chain operations:

### Identity Mapping

A wallet address on chain A must represent the same legal person on chain B:

1. **Attestation Carrying**: Claims travel with identity
2. **Decentralized Identity**: Portable across networks
3. **Compliance Recognition**: Same subject, any chain

### Operational Requirements

Before cross-chain activity:
- Destination contracts undergo allow-listing
- Settlement contracts receive whitelist treatment
- Freeze semantics map correctly
- Emergency interventions function on both sides

## Hybrid Deployment Models

Organizations often require hybrid approaches:

### Cloud + On-Premise

- **Control Plane**: On-premise for sovereignty
- **Data Plane**: Cloud for scalability
- **Blockchain Nodes**: Distributed globally
- **Backup Systems**: Multi-region redundancy

### Multi-Cloud Strategy

- **Primary**: AWS/Azure/GCP
- **Failover**: Alternative cloud provider
- **Edge Nodes**: CDN and regional presence
- **Disaster Recovery**: Cross-cloud backup

## Security Across Deployments

### Consistent Security Model

Regardless of deployment choice:
- Secrets management through Kubernetes secrets
- External credential stores integration
- OIDC/SAML authentication
- Network policies enforcement
- Least privilege access

### Compliance Evidence

Every deployment generates:
- Structured logs for audit
- Metrics for monitoring
- Evidence trails for regulators
- Compliance bundles on demand

## Migration Flexibility

Moving between models is a configuration exercise:

### Portability Guarantee

- **Same Contracts**: Identical smart contracts
- **Same Schema**: Consistent database structure
- **Same APIs**: ORPC procedures unchanged
- **Same UI**: Component library portable

### Migration Scenarios

1. **Cloud to On-Premise**: When regulations require
2. **On-Premise to Cloud**: For scaling needs
3. **Single to Multi-Chain**: Market expansion
4. **Public to Private**: Regulatory changes

## Deployment Checklist

### Pre-Deployment

- [ ] Network selection based on requirements
- [ ] Infrastructure model chosen
- [ ] Compliance requirements verified
- [ ] Identity provider integrated
- [ ] Monitoring stack configured

### Deployment

- [ ] Helm values customized
- [ ] Secrets configured
- [ ] DNS and certificates set
- [ ] Observability connected
- [ ] Backup strategy implemented

### Post-Deployment

- [ ] Health checks passing
- [ ] Compliance rules active
- [ ] Monitoring alerts configured
- [ ] Disaster recovery tested
- [ ] Documentation updated

## Operational Readiness

The CI command `bun run ci` ensures deployment readiness:

1. **Contract Compilation**: Solidity verification
2. **Code Generation**: TypeScript types
3. **Linting**: Code quality checks
4. **Testing**: Full test suite
5. **Security Scanning**: Vulnerability detection

## Why This Approach Matters

This deployment flexibility enables:

1. **Genuine Cross-Network Reach**: Without compliance blind spots
2. **Institutional Control**: Own your infrastructure
3. **Regulatory Confidence**: Demonstrable compliance
4. **Operational Excellence**: Production-ready from day one
5. **Future Flexibility**: Adapt as requirements change

The architectural discipline represents the difference between a demonstration system and a production platform that regulators can evaluate and approve. When institutions consider tokenization strategies, they need systems that extend their compliance capabilities rather than undermining them through technical convenience.

**Bottom line:** The Asset Tokenization Kit is deployable market infrastructure. Own the runtime, brand the experience, and maintain compliance—regardless of where you deploy.



