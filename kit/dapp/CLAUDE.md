# CLAUDE.md - Kit/Dapp Technology Stack

This document provides comprehensive guidance on the technologies, packages, and
architectural patterns used in the kit/dapp directory of the Asset Tokenization
Kit.

**⚠️ CRITICAL: AI agents MUST read the [./CLAUDE.md](./CLAUDE.md) shared
information before attempting any task to understand the project.**

## Core Technology Stack

### Frontend Framework

- **React** - UI library with React Compiler optimization
- **TanStack Start** - React framework integration for Vite
- **TypeScript** - Type safety and developer experience

### Routing & Navigation

- **TanStack Router** - File-based routing with type safety
  - Routes defined in `/src/routes/` directory
  - Automatic route tree generation
  - URL state management for persistent UI configuration

### State Management

- **TanStack Query** - Server state management
  - Integration with ORPC for type-safe data fetching
  - Persistent query caching
  - Optimistic updates support
- **React Context** - Client state management
  - Authentication state via AuthProvider
  - Theme state via NextThemesProvider
  - i18n state via I18nProvider

### Form Management

- **React Hook Form** - Form state and validation
- **TanStack Form** - Additional form utilities
- **Zod** - Schema validation integrated with forms

### API Layer

- **ORPC** - Type-safe RPC framework
  - Isomorphic client (server/client optimized)
  - OpenAPI generation
  - Zod validation integration
  - TanStack Query integration

### Authentication

- **Better Auth** - Comprehensive auth system
  - Email/password authentication
  - API key support
  - Passkey/WebAuthn
  - Multi-factor authentication (2FA, pincode, secret codes)
  - Session management with cookie caching

## UI Component Libraries

### Component System

- **Radix UI** - Accessible primitive components
  - Complete set of headless components
  - Accessibility built-in
  - Composable architecture
- **shadcn/ui** - Pre-styled component library
  - Built on top of Radix UI
  - Customizable via `components.json`
  - Components in `/src/components/ui/` (DO NOT MODIFY)

### Styling

- **Tailwind CSS** - Utility-first CSS
- **PostCSS** - CSS processing
- **tailwind-merge** - Class name merging
- **class-variance-authority** - Component variants
- **clsx** - Class name utilities

### Icons & Visual Elements

- **Lucide React** - Icon library
- **React Jazzicon** - Identicon generation

### Data Visualization

- **Recharts** - Charting library
- **Motion** - Animation library

### Advanced UI Components

- **TanStack Table** - Data tables
  - URL state persistence
  - Advanced filtering
  - Bulk actions
  - Export functionality
- **React Day Picker** - Date selection
- **Sonner** - Toast notifications
- **cmdk** - Command menu
- **Vaul** - Drawer component
- **Embla Carousel** - Carousel
- **React Resizable Panels** - Resizable layouts

## Database & Storage

### ORM

- **Drizzle ORM** - TypeScript-first ORM
- **Drizzle Kit** - Schema management and migrations
- **Drizzle Zod** - Zod schema generation
- **PostgreSQL** - Primary database

### GraphQL Clients

- **gql.tada** - GraphQL type generation
- **@settlemint/sdk-hasura** - Hasura GraphQL client
- **@settlemint/sdk-thegraph** - The Graph indexing client
- **@settlemint/sdk-portal** - Portal GraphQL client
- **@settlemint/sdk-blockscout** - Block explorer client

### Storage

- **@settlemint/sdk-ipfs** - IPFS integration
- **@settlemint/sdk-minio** - S3-compatible storage

## Web3 & Blockchain

### Core Web3

- **Viem** - Ethereum library
  - Address validation
  - Transaction handling
  - RPC client creation
  - Type-safe contract interactions

### Blockchain Integration Pattern

- **Server-side wallet management**
  - No client-side wallet providers (MetaMask, etc.)
  - Wallets created via Portal GraphQL API
  - HD key derivation for wallet generation
  - Automatic funding for development

### Smart Contract Interaction

- Transactions routed through Portal GraphQL
- TX Signer service handles blockchain transactions
- Challenge-response pattern for authorization
- Real-time transaction tracking

## Internationalization

### i18n Stack

- **i18next** - Core i18n framework
- **react-i18next** - React integration
- **i18n-iso-countries** - Country data
- **currency-codes** - Currency information

### Translation Management

- **Namespace-based organization**
  - Component-specific namespaces
  - Located in `/locales/{lang}/*.json`
- **Supported languages**: en, de, ar, ja
- **languine** - Translation file management

## Development Tools

### Build System

- **Vite** - Build tool and dev server
- **Bun** - JavaScript runtime and package manager
- **babel-plugin-react-compiler** - React optimization

### Code Quality

- **ESLint** - Code linting
  - TypeScript ESLint integration
  - TanStack plugin rules
  - React/React Hooks rules
  - Security rules
  - Import/export rules
  - Architecture boundaries
- **Prettier** - Code formatting (experimental CLI)

### Testing

- **Bun Test** - Test runner (NOT Vitest)
- Tests colocated with code
- E2E testing with Playwright

### Type Safety

- **TypeScript strict mode** - All strict flags enabled
- **Zod validators** - Runtime validation
  - Centralized in `/lib/zod/validators/`
  - Domain-specific validators
- **Type generation**:
  - Routes via TanStack Router CLI
  - GraphQL via gql.tada
  - API types via ORPC

## Utility Libraries

### Date & Time

- **date-fns** - Date manipulation

### Numbers

- **dnum** - Decimal number handling

### Cryptography

- **crypto-js** - Encryption utilities

### Serialization

- **superjson** - JSON with extra type support

### Environment

- **dotenv** - Environment variables
- **@t3-oss/env-core** - Environment validation

### Theming

- **next-themes** - Theme management
- **@fontsource-variable/figtree** - Variable font
- **@fontsource-variable/roboto-mono** - Monospace font

## Architectural Patterns

### File-Based Routing

```
/src/routes/
├── __root.tsx           # Root layout
├── _private.tsx         # Auth-required layout
├── _private/
│   ├── _onboarded.tsx   # Onboarded users layout
│   └── _onboarded/
│       └── _sidebar.tsx # Main app layout
├── auth.$pathname.tsx   # Auth routes
└── api/                 # API routes
```

### API Communication Flow

```
Frontend → ORPC Client → Type Validation → Backend Router → Service Layer
```

### Component Organization

- NO barrel files (direct imports only)
- Feature-based organization
- Shadcn UI components are immutable
- Tests colocated with components

### Error Handling

- `DefaultCatchBoundary` for routes
- `DataTableErrorBoundary` for tables
- Toast notifications for user feedback
- Structured logging with `createLogger()`

### Performance Optimization

- React Compiler via Babel plugin
- URL state for persistent UI config
- Query caching with TanStack Query
- Bundle analysis with vite-bundle-analyzer

## Usage Guidelines

### When Adding New Features

1. Use existing patterns (check similar features)
2. Leverage TanStack Router for new routes
3. Use ORPC for API endpoints
4. Follow Zod validation patterns
5. Use shadcn/ui components when possible

### When Adding Dependencies

1. Prefer packages already in the ecosystem
2. Check for TanStack ecosystem alternatives
3. Ensure TypeScript support
4. Consider bundle size impact

### Security Considerations

1. All blockchain interactions go through backend
2. No private keys in frontend code
3. Session-based authentication
4. CSRF protection enabled
5. Input validation with Zod

### Testing Requirements

1. Use Bun test runner (NOT Vitest)
2. Colocate tests with code
3. Test file naming: `*.test.ts(x)`
4. Integration tests for critical paths

This technology stack prioritizes type safety, developer experience, and
security while maintaining flexibility for tokenization use cases.
