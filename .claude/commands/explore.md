# Explore Project Architecture

## Purpose
Systematically understand a new or complex codebase before making changes. As recommended by Claude Code docs: "Let Claude explore first."

## Exploration Workflow

### Step 1: Project Overview
```bash
# Check project structure
find . -type f -name "*.json" | grep -E "(package|tsconfig|composer|cargo)" | head -10

# Identify main technologies
cat package.json | jq '.dependencies,.devDependencies' | jq -r 'keys[]' | sort | uniq

# Review documentation
find . -name "README*" -o -name "*.md" | grep -v node_modules | head -20
```

### Step 2: Architecture Analysis

Ask Claude Code to analyze specific aspects:

1. **Database Schema**
   - "Analyze the database schema and relationships"
   - "Show me all database models and their connections"

2. **API Structure**
   - "How are API endpoints organized in this project?"
   - "What authentication methods are used?"

3. **State Management**
   - "How does state management work in this app?"
   - "Where is global state stored?"

4. **Error Handling**
   - "How does error handling work in this app?"
   - "Show me the error boundary implementations"

### Step 3: Key File Discovery

```bash
# Find entry points
find . -name "index.*" -o -name "main.*" -o -name "app.*" | grep -v node_modules

# Locate configuration files
find . -name "*.config.*" -o -name ".*rc*" | grep -v node_modules

# Find test files to understand testing patterns
find . -name "*.test.*" -o -name "*.spec.*" | head -10
```

### Step 4: Dependency Analysis

```bash
# Check for monorepo structure
test -f lerna.json && echo "Lerna monorepo detected"
test -f pnpm-workspace.yaml && echo "PNPM workspace detected"
test -d packages && echo "Possible monorepo structure"

# Analyze build tools
ls -la | grep -E "(webpack|vite|rollup|esbuild|turbo)"
```

### Step 5: Code Patterns

Ask Claude Code to identify patterns:
- "What naming conventions are used for components?"
- "Show me examples of how API calls are made"
- "What testing patterns are used?"
- "How is authentication implemented?"

## Exploration Checklist

### Project Structure
- [ ] Main programming language(s)
- [ ] Framework(s) used
- [ ] Monorepo or single package
- [ ] Build system
- [ ] Test framework

### Architecture
- [ ] Frontend/backend separation
- [ ] API design pattern (REST/GraphQL/tRPC)
- [ ] Database type and ORM
- [ ] Authentication method
- [ ] State management approach

### Conventions
- [ ] Coding standards
- [ ] File naming patterns
- [ ] Component structure
- [ ] Import organization
- [ ] Error handling approach

### Development Workflow
- [ ] How to run locally
- [ ] How to run tests
- [ ] Deployment process
- [ ] CI/CD pipeline

## MCP Server Utilization

If MCP servers are configured, use them for deeper exploration:

```bash
# With GitHub MCP server
"Search our repository for authentication implementations"
"Show recent PRs related to API changes"

# With Postgres MCP server
"Show me all tables in the database"
"What indexes exist on the users table?"

# With filesystem MCP server
"Find all files containing TODO comments"
"Show me all configuration files"
```

## Output Format

After exploration, summarize findings:

```markdown
## Project: [Name]

### Tech Stack
- Language: TypeScript
- Framework: Next.js 14
- Database: PostgreSQL with Prisma
- Testing: Vitest + Playwright

### Key Directories
- `/app` - Next.js app router pages
- `/components` - React components
- `/lib` - Utility functions
- `/prisma` - Database schema

### Important Patterns
- API routes use Next.js route handlers
- Authentication via NextAuth
- Component naming: PascalCase
- Styles: Tailwind CSS

### Quick Start
1. Install: `bun install`
2. Database: `bun run db:migrate`
3. Dev server: `bun run dev`
4. Tests: `bun test`
```

## Remember

> "Before making changes, have Claude understand your project" - Claude Code Quickstart

Take time to explore thoroughly. Understanding the codebase prevents mistakes and speeds up development.