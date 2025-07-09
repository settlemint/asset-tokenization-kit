# DApp Frontend Documentation

_This file documents the React frontend application architecture and patterns within the Asset Tokenization Kit._

## Application Overview

The DApp frontend is a modern React application built with:
- **Framework**: Vite + React with TypeScript
- **Routing**: TanStack Router (file-based routing)
- **RPC**: ORPC for type-safe server functions
- **Database**: Drizzle ORM with PostgreSQL
- **Styling**: Tailwind CSS with shadcn/ui components
- **i18n**: Multi-language support (AR, DE, EN, JA)

## Architecture Patterns

### Actions System Integration

**New Feature**: The actions system provides workflow management for time-sensitive operations requiring user approval.

**Key Components:**
- **Actions Table** (`src/components/issuer-dashboard/actions-table.tsx`): Main interface for action management
- **ORPC API** (`src/orpc/routes/token/routes/token.actions.ts`): Backend API for action queries
- **Status Management**: Centralized `ActionStatusEnum` for consistent UI states
- **i18n Support**: Comprehensive translations for all action-related UI

**Architecture Benefits:**
- **Type Safety**: End-to-end TypeScript from schema to UI
- **Real-time Updates**: GraphQL subscriptions for live action status
- **Scalable Filtering**: Advanced filtering by status, type, and user
- **Responsive Design**: Mobile-first design with proper accessibility

### UI Component System

**Enhanced Components:**
- **Data Table**: Improved empty state handling with contextual messaging
- **Status Indicators**: Visual badges with icons for action states
- **Filtering**: Advanced filter components with URL state persistence
- **Pagination**: Configurable pagination with performance optimization

### ORPC Integration

**Server Functions Pattern:**
- **Type-Safe APIs**: Zod schema validation for all endpoints
- **GraphQL Client**: Direct subgraph integration for blockchain data
- **Authentication**: Integrated auth middleware for protected routes
- **Error Handling**: Structured error responses with proper HTTP codes

## Development Workflow

### Component Development
1. Create components in appropriate directories under `src/components/`
2. Use existing UI components from `src/components/ui/`
3. Implement proper TypeScript types and interfaces
4. Add i18n support with namespaced translation keys
5. Write unit tests for complex logic

### API Development
1. Define schemas in `src/orpc/routes/*/routes/*.schema.ts`
2. Implement handlers in `src/orpc/routes/*/routes/*.ts`
3. Add proper authentication and authorization
4. Document API endpoints with JSDoc
5. Add integration tests for critical paths

### Integration Testing
- **UI Testing**: Playwright tests for user workflows
- **API Testing**: ORPC endpoint testing with mock data
- **E2E Testing**: Complete user journeys across the application

## Best Practices

### Code Organization
- **Co-location**: Keep related files together (components, hooks, utils)
- **Separation of Concerns**: Separate UI, business logic, and data access
- **Reusability**: Create reusable components and hooks
- **Type Safety**: Use TypeScript for all code with proper type definitions

### Performance Optimization
- **Code Splitting**: Dynamic imports for routes and heavy components
- **Memoization**: Use React.memo and useMemo judiciously
- **Optimistic Updates**: Update UI optimistically for better UX
- **Caching**: Leverage TanStack Query for efficient data caching

### Security
- **Input Validation**: Validate all user inputs on client and server
- **Authentication**: Proper session management and token validation
- **Authorization**: Check user permissions before sensitive operations
- **Data Sanitization**: Prevent XSS and injection attacks

## Recent Enhancements

### Actions System
- **Complete workflow management** for pending operations
- **Time-based activation** with expiration handling
- **Multi-user authorization** with proper permission checks
- **Real-time status updates** through GraphQL subscriptions

### UI Improvements
- **Enhanced data tables** with better empty states
- **Improved pagination** with configurable page sizes
- **Better error handling** with user-friendly messages
- **Accessibility improvements** with proper ARIA labels

### i18n Expansion
- **Actions table translations** for all UI elements
- **Status-specific messaging** for different action states
- **Context-aware empty states** with localized content
- **Consistent terminology** across all action-related features

---

_For specific implementation details, see the feature-specific documentation in `src/components/CLAUDE.md` and `src/orpc/CLAUDE.md`._