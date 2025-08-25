# Suggested Development Commands

## Installation & Setup
```bash
bun install              # Install all dependencies
bun turbo link          # Enable remote caching
bun run artifacts       # Generate contract artifacts, genesis, ABIs
bun run dev:up          # Start Docker Compose services
bun run dev:reset       # Clean and restart Docker with fresh state
```

## Development Workflow
```bash
bun run dev             # Start development environment
cd kit/dapp && bun run dev  # Run dApp locally
bun run watch           # Watch mode for TypeScript
```

## Code Quality & Testing
```bash
# Full CI Pipeline (run before PR)
bun run ci              # Format, compile, codegen, lint, typecheck, build, test

# Individual commands
bun run format          # Format with Prettier
bun run lint            # Lint with ESLint (max warnings: 0)
bun run typecheck       # Type-check TypeScript
bun run test            # Run unit tests
bun run test:integration # Run integration tests
bun run compile         # Compile smart contracts
bun run codegen         # Generate types and bindings
bun run build           # Build all packages
```

## Database Management (from kit/dapp)
```bash
bun run db:generate     # Generate Drizzle migrations
bun run db:migrate      # Apply migrations
bun run db:studio       # Open Drizzle Studio UI
bun run db:check        # Check migration status
```

## Contract Development
```bash
cd kit/contracts
bun run test            # Run Foundry tests
bunx turbo contracts#publish  # Deploy to local network
```

## Subgraph Testing
```bash
bunx turbo subgraph#test:integration  # Test subgraph integration
```

## E2E Testing
```bash
bun run test:e2e:ui     # Run UI E2E tests
bun run test:e2e:ui:debug  # Debug UI tests with Playwright UI
bun run test:e2e:api    # Run API E2E tests
bun run test:e2e:api:debug # Debug API tests
```

## Package-specific Testing (from kit/dapp)
```bash
bun run test:unit       # Run unit tests
bun run test:unit:watch # Watch mode
bun run test:unit:ui    # Vitest UI
bun run test:unit:coverage # With coverage
```

## Utilities
```bash
bun run clean           # Clean all build artifacts
bun run version         # Update version
bun run extract-env     # Extract environment variables
settlemint connect --instance local  # Connect to local blockchain
```

## Turbo Commands
```bash
turbo run build --filter=dapp  # Build specific package
turbo run test --filter=contracts  # Test specific package
turbo dev               # Run all dev tasks in parallel
```

## Docker Management
```bash
docker compose -p atk up -d     # Start services
docker compose -p atk down      # Stop services
docker compose -p atk logs -f   # View logs
```