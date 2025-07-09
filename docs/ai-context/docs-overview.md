# Documentation Architecture

This project uses a **3-tier documentation system** that organizes knowledge by stability and scope, enabling efficient AI context loading and scalable development for the SettleMint Asset Tokenization Kit.

## How the 3-Tier System Works

**Tier 1 (Foundation)**: Stable, system-wide documentation that rarely changes - architectural principles, technology decisions, cross-component patterns, and core development protocols.

**Tier 2 (Component)**: Architectural charters for major components - high-level design principles, integration patterns, and component-wide conventions without feature-specific details.

**Tier 3 (Feature-Specific)**: Granular documentation co-located with code - specific implementation patterns, technical details, and local architectural decisions that evolve with features.

This hierarchy allows AI agents to load targeted context efficiently while maintaining a stable foundation of core knowledge.

## Documentation Principles
- **Co-location**: Documentation lives near relevant code
- **Smart Extension**: New documentation files created automatically when warranted
- **AI-First**: Optimized for efficient AI context loading and machine-readable patterns

## Tier 1: Foundational Documentation (System-Wide)

- **[Master Context](/CLAUDE.md)** - *Essential for every session.* Coding standards, security requirements, essential commands, and development protocols
- **[Project Structure](/docs/ai-context/project-structure.md)** - *REQUIRED reading.* Complete technology stack, file tree, and system architecture
- **[System Integration](/docs/ai-context/system-integration.md)** - *For cross-component work.* Communication patterns, data flow, testing strategies, and performance optimization
- **[Deployment Infrastructure](/docs/ai-context/deployment-infrastructure.md)** - *Infrastructure patterns.* Docker Compose, Helm charts, monitoring, CI/CD workflows, and scaling strategies
- **[Task Management](/docs/ai-context/handoff.md)** - *Session continuity.* Current tasks, documentation system progress, and next session goals

## Tier 2: Component-Level Documentation

### Application Components
- **[DApp Frontend](/kit/dapp/CLAUDE.md)** - *React application.* TanStack Router, ORPC, Drizzle ORM, multi-language suppor
- **[Smart Contracts](/kit/contracts/CLAUDE.md)** - *Blockchain contracts.* Asset tokenization (Bond, Equity, Fund, Deposit, StableCoin), SMART compliance, OnChainID
- **[Subgraph](/kit/subgraph/CLAUDE.md)** - *The Graph indexing.* Event processing, entity relationships, GraphQL schema

### Infrastructure Components
- **[Helm Charts](/kit/charts/CLAUDE.md)** - *Kubernetes deployment.* Main ATK chart, service configurations, subchart dependencies
- **[E2E Testing](/kit/e2e/CLAUDE.md)** - *Playwright tests.* UI tests, API tests, test utilities

### Supporting Services
- **[TX Signer](/kit/charts/atk/charts/txsigner/CLAUDE.md)** - *Transaction signing.* Key management, signature generation
- **[Portal](/kit/charts/atk/charts/portal/CLAUDE.md)** - *Admin interface.* Blockchain configuration, contract deployment
- **[Hasura](/kit/charts/atk/charts/hasura/CLAUDE.md)** - *GraphQL engine.* Database federation, real-time subscriptions
- **[The Graph](/kit/charts/atk/charts/thegraph/CLAUDE.md)** - *Blockchain indexing.* Event processing, data queries
- **[Blockscout](/kit/charts/atk/charts/blockscout/CLAUDE.md)** - *Block explorer.* Transaction history, contract verification

## Tier 3: Feature-Specific Documentation

Granular CLAUDE.md files co-located with code for minimal cascade effects:

### Smart Contract Documentation
- **[Asset Contracts](/kit/contracts/contracts/assets/CLAUDE.md)** - *Token implementations.* Bond, Equity, Fund, Deposit, StableCoin patterns
- **[System Contracts](/kit/contracts/contracts/system/CLAUDE.md)** - *Core system.* Factory patterns, proxy implementations, access control
- **[SMART Compliance](/kit/contracts/contracts/smart/CLAUDE.md)** - *Compliance framework.* Transfer restrictions, identity verification
- **[OnChainID](/kit/contracts/contracts/onchainid/CLAUDE.md)** - *Identity system.* Claims, keys, identity management
- **[Addons](/kit/contracts/contracts/addons/CLAUDE.md)** - *Extensions.* Airdrops, vaults, yield schedules, XvP settlements

### Frontend Feature Documentation
- **[Routes](/kit/dapp/src/routes/CLAUDE.md)** - *Page components.* Authentication, portfolio, admin, asset management
- **[Components](/kit/dapp/src/components/CLAUDE.md)** - *UI components.* Forms, tables, charts, modals
- **[ORPC API](/kit/dapp/src/orpc/CLAUDE.md)** - *Server functions.* Asset operations, authentication, data fetching
- **[Database](/kit/dapp/src/lib/db/CLAUDE.md)** - *Drizzle ORM.* Schemas, queries, migrations
- **[Localization](/kit/dapp/locales/CLAUDE.md)** - *i18n.* Translation files, language support

### Subgraph Feature Documentation
- **[Actions System](/kit/subgraph/src/actions/CLAUDE.md)** - *Workflow management.* Action lifecycle, executor authorization, XvP integration

### Testing Documentation
- **[UI Tests](/kit/e2e/ui-tests/CLAUDE.md)** - *Playwright UI tests.* Asset creation, validation, user flows
- **[API Tests](/kit/e2e/api-tests/CLAUDE.md)** - *Playwright API tests.* Contract interactions, data validation
- **[Contract Tests](/kit/contracts/test/CLAUDE.md)** - *Foundry tests.* Unit tests, integration tests, fuzzing

### Infrastructure Feature Documentation
- **[Docker Setup](/tools/docker/CLAUDE.md)** - *Container configuration.* Service definitions, networking
- **[Chart Values](/kit/charts/atk/values.yaml)** - *Helm configuration.* Service settings, resource limits
- **[Observability](/kit/charts/atk/charts/observability/CLAUDE.md)** - *Monitoring stack.* Metrics, logs, traces

## Adding New Documentation

### New Component
1. Create `/component/CLAUDE.md` (Tier 2)
2. Add entry to this file under appropriate section
3. Create feature-specific Tier 3 docs as features develop

### New Feature
1. Create `/component/src/feature/CLAUDE.md` (Tier 3)
2. Reference parent component patterns
3. Add entry to this file under component's features

### Deprecating Documentation
1. Remove obsolete CLAUDE.md files (especially from dapp-v1 folder which is deprecated)
2. Update this mapping document
3. Check for broken references in other docs

---

*Note: The dapp-v1 folder is deprecated and should not be modified or documented. All new development should focus on the kit/dapp folder.*