https://console.settlemint.com/documentation/application-kits/introduction 

Docs should be finished (fuma docs)

Runbooks for ATKv2 

How to make changes to contracts

How to deploy your own contracts

How to make changes to the subgrah

How to deploy the subgraph

…

Look at bun (guides)

ATK Documentation Master Plan

Sales-Ready Comprehensive Documentation Framework

🎯 Executive Decision Framework

Core Decisions

Platform Name: ATK (Asset Tokenization Kit) - primary everywhere

Repository: New centralized atk-docs repository

Framework: FumaDocs with ATK dedicated dropdown section

Timeline: 5-6 days to sales-ready (start today/tomorrow latest)

Priority: Level 2 Usage docs first (biggest gap at 15% complete)

Three-Level Architecture with Completion Status

Generic (Book of DALP style) - 85% COMPLETE ✅

Usage (Operations) - 15% complete ❌ CRITICAL GAP

Developer (Modifications) - 30% complete ⚠️

📊 Current State Analysis

What We Have (Ready to Use)

Level

Existing Content

Completeness

Action

Level 1 - Business

atk-docs-wip/ATK_COMPREHENSIVE_PLATFORM_GUIDE_PROFESSIONAL.md (868 lines)<br>atk-docs-wip/ATK_INSTITUTIONAL_FAQ.md (93 lines)<br>the-book-of-dalp/* (50+ chapters) - 100% source of truth

85%

Copy & Polish

Level 2 - Usage

Scattered across 30+ docs in kit/docs/content/docs/<br>Some workflows (21-25)

15%

CREATE NEW

Level 3 - Developer

Contract READMEs (2,500+ lines)<br>ORPC/middleware docs<br>Test examples

30%

Consolidate & Generate

What We're Missing (Must Create)

❌ "Your First Token in 10 Minutes" guide (TOP PRIORITY)

❌ User Management & Platform Administration

❌ Asset Lifecycle Operations

❌ Compliance Configuration Guides

❌ Banking & Exchange Integration Guides

❌ Troubleshooting & Recovery Procedures (20 common errors)

❌ API Reference Documentation (auto-generate)

❌ Modification Guides with Guardrails

❌ Regional Compliance Guides (MiCA, SEC, MAS)

❌ Pricing/Licensing Documentation

❌ Video Tutorial References

❌ Real Customer Success Stories with Numbers

🏗️ Complete Documentation Structure (fumadocs-Ready)

atk-docs/
├── README.md                          # Landing with three-level orientation
├── QUICKSTART.md                      # ⭐ Your First Token in 10 Minutes
│
├── level-1-generic/                   # LEVEL 1 - Business (85% ready)
│   ├── 01-overview/
│   │   ├── index.md                  # What ATK is and why it wins
│   │   ├── market-opportunity.md     # $2.3T RWA market analysis
│   │   ├── platform-capabilities.md  # Complete institutional infrastructure
│   │   ├── business-value-roi.md     # 95% cost reduction, 3-6 month payback
│   │   └── settlemint-authority.md   # Track record, patents, expertise
│   ├── 02-architecture/
│   │   ├── index.md                  # Layers, flows, trust boundaries
│   │   ├── three-layer-model.md      # SMART/System/dApp explained
│   │   ├── compliance-framework.md   # Turning law into software
│   │   └── chain-agnostic.md         # Deploy on any EVM chain
│   ├── 03-positioning/
│   │   ├── index.md                  # Market leadership
│   │   ├── competitive-analysis.md   # Platform vs point solutions
│   │   ├── success-stories.md        # Real customer case studies
│   │   └── reference-architectures.md # Proven patterns
│   ├── 04-compliance-identity/
│   │   ├── index.md                  # Regulatory overview
│   │   ├── regional-guides/
│   │   │   ├── europe-mica.md       # MiCA compliance (€8M limits)
│   │   │   ├── us-sec.md            # SEC regulations (Reg D/S/CF/A+)
│   │   │   ├── singapore-mas.md     # MAS framework
│   │   │   └── gcc-regulations.md   # Middle East requirements
│   │   └── identity-onchainid.md    # ERC-734/735 implementation
│   ├── 05-asset-classes/
│   │   ├── bonds.md                 # Fixed-term debt instruments
│   │   ├── equity.md                # Voting rights and governance
│   │   ├── funds.md                 # NAV calculations, fees
│   │   ├── stablecoins.md          # Collateral-backed tokens
│   │   └── deposits.md              # Simple deposit certificates
│   ├── 06-integration-ecosystem.md  # Banking, custody, venues overview
│   ├── 07-pricing-licensing.md      # Commercial terms and options
│   ├── 08-glossary.md              # ATK terminology and concepts
│   └── 09-faq.md                   # From ATK_INSTITUTIONAL_FAQ.md
│
├── level-2-usage/                    # LEVEL 2 - Operations (CREATE NEW - CRITICAL)
│   ├── 00-quickstart/
│   │   ├── first-token-10min.md    # ⭐ Sales demo priority
│   │   ├── quickstart-guide.md     # 15-minute full setup
│   │   └── video-tutorials.md      # Links to visual guides
│   ├── 01-installation/
│   │   ├── local-setup.md          # Docker, Bun, development
│   │   ├── cloud-deployment.md     # Kubernetes, production
│   │   ├── configuration.md        # Environment variables
│   │   └── system-requirements.md  # Hardware, software, network
│   ├── 02-administration/
│   │   ├── user-management.md      # 19 roles, permissions matrix
│   │   ├── identity-kyc.md         # OnchainID registration, claims
│   │   ├── trusted-issuers.md      # KYC provider management
│   │   ├── platform-settings.md    # System configuration
│   │   └── audit-logging.md        # Activity tracking
│   ├── 03-asset-operations/
│   │   ├── asset-designer-wizard.md # 6-step creation process
│   │   ├── token-lifecycle.md      # Create, mint, transfer, mature
│   │   ├── corporate-actions.md    # Dividends, splits, voting
│   │   ├── yield-management.md     # Interest distributions
│   │   └── redemption-process.md   # Maturity and unwinding
│   ├── 04-compliance-config/
│   │   ├── compliance-modules.md   # 10+ module configuration
│   │   ├── logic-expressions.md    # AND/OR/NOT rule builder
│   │   ├── country-restrictions.md # Geo-blocking setup
│   │   ├── investor-limits.md      # Max holder configuration
│   │   └── transfer-approvals.md   # Manual review workflows
│   ├── 05-workflows/
│   │   ├── bonds/
│   │   │   ├── issuance.md        # Bond creation process
│   │   │   ├── maturity.md        # Maturation handling
│   │   │   └── redemption.md      # Payout procedures
│   │   ├── equity/
│   │   │   ├── share-issuance.md  # Stock creation
│   │   │   ├── voting.md          # Governance processes
│   │   │   └── dividends.md       # Distribution workflows
│   │   ├── funds/
│   │   │   ├── fund-creation.md   # Fund setup
│   │   │   ├── nav-calculation.md # Net asset value
│   │   │   └── fee-collection.md  # Management fees
│   │   ├── stablecoins/
│   │   │   ├── minting.md         # Token creation
│   │   │   ├── collateral.md      # Backing management
│   │   │   └── pegging.md         # Price stability
│   │   └── deposits/
│   │       ├── certificate.md     # Deposit creation
│   │       └── yields.md          # Interest handling
│   ├── 06-operations/
│   │   ├── monitoring/
│   │   │   ├── health-checks.md   # System health
│   │   │   ├── performance.md     # Metrics and KPIs
│   │   │   └── alerts.md          # Notification setup
│   │   ├── backup-recovery/
│   │   │   ├── backup-procedures.md # Data protection
│   │   │   ├── disaster-recovery.md # Business continuity
│   │   │   └── rollback-guide.md    # Version recovery
│   │   └── maintenance/
│   │       ├── upgrades.md        # System updates
│   │       └── scheduled-tasks.md # Routine operations
│   ├── 07-integrations/
│   │   ├── banking/
│   │   │   ├── core-banking.md    # Bank connections
│   │   │   ├── swift-integration.md # SWIFT messaging
│   │   │   └── ach-setup.md       # ACH transfers
│   │   ├── exchanges/
│   │   │   ├── dex-listing.md     # Decentralized exchange
│   │   │   ├── cex-listing.md     # Centralized exchange
│   │   │   └── liquidity-pools.md # Market making
│   │   ├── custody/
│   │   │   ├── digital-custody.md # Custody providers
│   │   │   ├── multi-sig.md       # Multi-signature setup
│   │   │   └── cold-storage.md    # Offline security
│   │   └── enterprise/
│   │       ├── erp-integration.md # ERP systems
│   │       ├── crm-connection.md  # CRM platforms
│   │       └── reporting-apis.md  # Data exports
│   └── 08-troubleshooting/
│       ├── common-errors.md       # Top 20 errors & solutions
│       ├── transaction-issues.md  # Failed TX debugging
│       ├── wallet-recovery.md     # Lost access procedures
│       ├── compliance-failures.md # Rule violation fixes
│       ├── performance-issues.md  # Optimization guide
│       └── support-escalation.md  # When & how to get help
│
├── level-3-developer/                # LEVEL 3 - Modifications (CONSOLIDATE)
│   ├── 01-architecture/
│   │   ├── system-overview.md     # Monorepo, services, data flow
│   │   ├── smart-protocol.md      # SMART foundation layer
│   │   ├── atk-system.md          # Infrastructure contracts
│   │   ├── dapp-frontend.md       # Next.js, TanStack, UI
│   │   └── backend-apis.md        # ORPC, GraphQL, REST
│   ├── 02-contracts/
│   │   ├── smart-foundation/
│   │   │   ├── core-token.md     # Base implementation
│   │   │   ├── extensions.md     # 10 modular extensions
│   │   │   └── upgradeability.md # UUPS patterns
│   │   ├── system-contracts/
│   │   │   ├── factories.md      # Factory patterns
│   │   │   ├── registries.md    # Registry contracts
│   │   │   └── access-control.md # Role management
│   │   ├── asset-implementations/
│   │   │   ├── bond-contract.md  # Bond specifics
│   │   │   ├── equity-contract.md # Share implementation
│   │   │   ├── fund-contract.md  # Fund mechanics
│   │   │   ├── stablecoin.md    # Stable token logic
│   │   │   └── deposit.md       # Deposit contract
│   │   ├── addons/
│   │   │   ├── airdrop.md       # Token distribution
│   │   │   ├── vault.md         # Multi-sig treasury
│   │   │   ├── xvp-settlement.md # Atomic swaps
│   │   │   └── token-sale.md    # Sale mechanics
│   │   ├── compliance-modules/
│   │   │   ├── module-interface.md # IComplianceModule
│   │   │   ├── custom-rules.md    # Creating new rules
│   │   │   └── testing-modules.md # Validation tests
│   │   └── testing/
│   │       ├── foundry-tests.md  # Forge testing
│   │       ├── hardhat-tests.md  # Hardhat suite
│   │       └── gas-optimization.md # Gas profiling
│   ├── 03-dapp/
│   │   ├── architecture/
│   │   │   ├── app-router.md    # Next.js 15 structure
│   │   │   ├── server-components.md # RSC patterns
│   │   │   └── client-state.md  # State management
│   │   ├── orpc-api/
│   │   │   ├── procedures.md    # API endpoints
│   │   │   ├── middleware.md    # Auth, logging
│   │   │   └── type-safety.md   # Zod schemas
│   │   ├── ui-components/
│   │   │   ├── radix-ui.md     # Component library
│   │   │   ├── tailwind.md     # Styling system
│   │   │   └── custom-components.md # Building new UI
│   │   └── authentication/
│   │       ├── better-auth.md  # Auth system
│   │       └── wallet-connect.md # Web3 auth
│   ├── 04-data/
│   │   ├── database/
│   │   │   ├── schema-design.md # Drizzle ORM
│   │   │   ├── migrations.md   # Schema changes
│   │   │   └── queries.md      # Data access
│   │   ├── subgraph/
│   │   │   ├── schema.md       # GraphQL schema
│   │   │   ├── mappings.md     # Event handlers
│   │   │   └── indexing.md     # TheGraph setup
│   │   └── graphql/
│   │       ├── hasura-setup.md # Hasura config
│   │       └── queries.md      # GraphQL operations
│   ├── 05-infrastructure/
│   │   ├── kubernetes/
│   │   │   ├── helm-charts.md  # Chart structure
│   │   │   ├── values.md       # Configuration
│   │   │   └── deployment.md   # K8s deployment
│   │   ├── ci-cd/
│   │   │   ├── github-actions.md # CI pipelines
│   │   │   ├── build-process.md # Turbo builds
│   │   │   └── deployment.md   # CD workflows
│   │   └── monitoring/
│   │       ├── prometheus.md   # Metrics collection
│   │       ├── grafana.md      # Dashboards
│   │       └── logging.md      # Loki setup
│   ├── 06-modification-guides/
│   │   ├── add-asset-type.md   # New asset creation
│   │   ├── extend-compliance.md # Custom modules
│   │   ├── customize-ui.md     # UI modifications
│   │   ├── api-extensions.md   # New endpoints
│   │   ├── integration-guide.md # External systems
│   │   └── migration-guide.md  # Upgrading ATK
│   ├── 07-api-reference/         # Auto-generated
│   │   ├── typescript/          # TypeDoc output
│   │   ├── solidity/           # Forge doc output
│   │   └── graphql/            # Schema docs
│   ├── 08-contribution.md      # Standards and review
│   └── 09-style-guide.md       # Code conventions
│
├── security/                    # Security & Compliance
│   ├── security-model.md       # Threat model, boundaries
│   ├── audit-reports.md        # Security assessments
│   ├── disclosure-policy.md    # Responsible disclosure
│   ├── incident-response.md    # Security procedures
│   └── compliance-matrix.md    # Regulatory mapping
│
├── releases/                    # Version Management
│   ├── release-notes.md        # Version history
│   ├── migration-guides.md     # Upgrade procedures
│   ├── deprecation.md          # Sunset policies
│   └── support-policy.md       # LTS versions
│
└── resources/                   # Additional Resources
    ├── videos.md               # Tutorial links
    ├── case-studies.md         # Customer stories
    ├── benchmarks.md           # Performance data
    └── roadmap.md              # Future plans

