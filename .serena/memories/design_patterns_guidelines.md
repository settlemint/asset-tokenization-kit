# Design Patterns and Guidelines

## Architectural Principles

### Monorepo Best Practices
- **Workspace Isolation**: Each package is self-contained
- **Dependency Management**: Use `workspace:*` protocol for internal deps
- **Build Order**: Turborepo handles via `dependsOn` in turbo.json
- **Shared Code**: Place in `packages/` directory
- **No Cross-Package Imports**: Except through proper dependencies

### Server/Client Architecture (Next.js App Router)
- **Server Components Default**: Render on server for better performance
- **Client Components**: Only when interactivity needed (use 'use client')
- **Data Fetching**: At component level, avoid prop drilling
- **Parallel Routes**: For modals and complex UI states
- **Route Groups**: For organization without affecting URLs

## Code Patterns

### TypeScript Patterns
- **Type Safety First**: Leverage strict mode fully
- **Runtime Validation**: Use Zod schemas with inferred types
- **Branded Types**: For domain IDs (UserId, TokenId, etc.)
- **Discriminated Unions**: For state management
- **Type Guards**: User-defined for runtime type checking

### React Patterns
- **Composition over Inheritance**: Use hooks and HOCs
- **Custom Hooks**: Extract reusable logic
- **Suspense Boundaries**: For async data loading
- **Error Boundaries**: Catch and handle errors gracefully
- **Context Sparingly**: Avoid prop drilling but don't overuse

### API Design (ORPC)
- **Procedure-based**: Define clear, focused procedures
- **Zod Validation**: Input/output validation
- **Middleware**: For auth, logging, rate limiting
- **Type Safety**: End-to-end type inference
- **Error Handling**: Consistent error responses

### Database Patterns (Drizzle)
- **Schema-First**: Define in TypeScript
- **Migrations**: Version control schema changes
- **Soft Deletes**: Where appropriate for audit trails
- **Prepared Statements**: For performance
- **Relations**: Define in schema for type-safe joins

### Smart Contract Patterns
- **Upgradeable Contracts**: Use proxy patterns when needed
- **Access Control**: Role-based permissions
- **Gas Optimization**: Batch operations, efficient storage
- **Event Emission**: For off-chain indexing
- **Testing**: Comprehensive unit and integration tests

## Security Guidelines

### Authentication & Authorization
- **Session-based**: Using Better Auth
- **PKCE Flow**: For OAuth implementations
- **HttpOnly Cookies**: For sensitive data
- **Rate Limiting**: On auth endpoints
- **Role-based Access**: Check permissions at API level

### Data Handling
- **Input Validation**: Always validate with Zod
- **SQL Injection Prevention**: Use parameterized queries
- **XSS Prevention**: Sanitize user input
- **CSRF Protection**: Token validation
- **Secrets Management**: Environment variables, never in code

## Performance Optimization

### Frontend
- **Code Splitting**: Automatic with Next.js
- **Image Optimization**: Use Next.js Image component
- **Bundle Size**: Monitor and optimize
- **Caching**: Leverage TanStack Query
- **Lazy Loading**: Components and routes

### Backend
- **Database Indexing**: Optimize query performance
- **Connection Pooling**: Manage database connections
- **Caching Strategy**: Redis for session/data caching
- **Query Optimization**: Avoid N+1 problems
- **Background Jobs**: Offload heavy processing

## Testing Strategy

### Unit Testing
- **Component Testing**: React Testing Library
- **Logic Testing**: Pure functions and hooks
- **Mocking**: External dependencies
- **Coverage Target**: Aim for >80%

### Integration Testing
- **API Testing**: ORPC procedures
- **Database Testing**: With test database
- **Contract Testing**: Foundry/Hardhat tests

### E2E Testing
- **User Flows**: Critical paths
- **Cross-browser**: Test major browsers
- **Responsive**: Test mobile/tablet/desktop

## Documentation Standards

### Code Documentation
- **Self-documenting Code**: Clear naming over comments
- **Complex Logic**: Add explanatory comments
- **API Documentation**: OpenAPI from ORPC
- **Type Documentation**: JSDoc for public APIs

### Project Documentation
- **README Files**: Per package
- **Architecture Docs**: Major decisions
- **Setup Guides**: For new developers
- **API Guides**: Usage examples

## Development Workflow

### Branch Strategy
- **Feature Branches**: `feat/description`
- **Bug Fixes**: `fix/description`
- **Chores**: `chore/description`
- **No Direct Main Commits**: Always use PRs

### Commit Convention
- **Conventional Commits**: `type(scope): description`
- **Types**: feat, fix, docs, style, refactor, test, chore
- **Atomic Commits**: One logical change per commit

### Code Review
- **PR Template**: Description, testing, checklist
- **CI Must Pass**: All checks green
- **Peer Review**: At least one approval
- **Security Review**: For sensitive changes