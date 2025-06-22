# Using MCP Servers Effectively

## Purpose
Guide for leveraging Model Context Protocol (MCP) servers to enhance Claude Code's capabilities beyond basic file operations.

## Available MCP Servers

### 1. Sentry - Error Tracking
**Transport**: HTTP  
**URL**: `https://mcp.sentry.dev/mcp`

#### Common Use Cases
```
"Show me the most recent errors in production"
"What errors occurred in the last 24 hours?"
"Are there any performance regressions?"
"Show errors related to authentication"
"What's the error rate trend this week?"
```

### 2. Linear - Project Management
**Transport**: SSE  
**URL**: `https://mcp.linear.app/sse`  
**Scope**: User

#### Common Use Cases
```
"Show my assigned Linear issues"
"Create a bug report for this issue"
"What issues are in the current sprint?"
"Update issue LIN-123 with progress"
"Show high-priority bugs"
```

### 3. Context7 - Documentation
**Transport**: SSE  
**URL**: `https://mcp.context7.com/sse`

#### Common Use Cases
```
"Get React 18 hooks documentation"
"Show Next.js 14 app router patterns"
"Find Prisma relation query examples"
"Get TypeScript utility types reference"
"Show Tailwind CSS animation classes"
```

### 4. GitHub - Repository Operations
**Transport**: SSE with OAuth  
**URL**: `https://api.github.com/mcp/sse`  
**Auth**: OAuth (browser flow)

#### Common Use Cases
```
"Search for open issues with 'bug' label"
"Show my recent pull requests"
"Find all mentions of deprecated functions"
"Get contributors statistics"
"List recent releases and their notes"
"Search code for TODO comments"
```

#### GitHub Workflow
1. Search existing issues before creating new ones
2. Review related PRs for context
3. Check code history for changes
4. Monitor CI/CD status

### 5. DeepWiki - Advanced Documentation
**Transport**: SSE with OAuth  
**URL**: `https://api.devin.ai/mcp/deepwiki/sse`  
**Auth**: OAuth (browser flow)

#### Common Use Cases
```
"Explain React fiber architecture in detail"
"Deep dive into V8 JavaScript engine optimizations"
"Research CAP theorem and its implications"
"Advanced TypeScript conditional types patterns"
"Kubernetes networking model explained"
```

#### DeepWiki Research Workflow
1. Use for complex technical concepts
2. Get architectural deep dives
3. Understand implementation details
4. Research computer science fundamentals

## Integration Patterns

### Error-Driven Development
When fixing bugs:
1. Use Sentry to identify error patterns
2. Create or update Linear issue
3. Use Context7 to find relevant documentation
4. Implement fix with proper error handling

### Feature Development
When building features:
1. Check Linear for requirements and acceptance criteria
2. Use Context7 for library documentation
3. Monitor Sentry for any new errors after deployment

### Code Review Preparation
Before creating PR:
1. Check Sentry for any errors in changed code paths
2. Update Linear issues with implementation details
3. Reference documentation for non-obvious patterns

## MCP Server Commands Reference

### Sentry Commands
- `sentry:errors` - List recent errors
- `sentry:issues` - Show grouped issues
- `sentry:performance` - Performance metrics
- `sentry:releases` - Release information

### Linear Commands
- `linear:issues` - List issues
- `linear:create` - Create new issue
- `linear:update` - Update existing issue
- `linear:projects` - Show projects

### Context7 Commands
- `context7:search` - Search documentation
- `context7:get` - Get specific docs
- `context7:examples` - Find code examples

## Best Practices

### 1. Cross-Reference Information
- Correlate Sentry errors with Linear issues
- Use Context7 docs to understand error causes
- Link fixes to both error tracking and issues

### 2. Proactive Monitoring
- Check Sentry before deploying
- Review Linear for related issues
- Verify documentation is current

### 3. Efficient Workflows
- Batch similar queries together
- Cache documentation lookups
- Link related items across systems

## Example Integrated Workflow

```bash
# 1. Identify the problem
"Show me authentication errors from Sentry in the last 24 hours"

# 2. Check for existing issues
"Search Linear for authentication bug issues"
"Search GitHub issues for similar authentication errors"

# 3. Get documentation
"Find Next-Auth.js error handling documentation from Context7"
"DeepWiki: explain OAuth 2.0 PKCE flow in detail"

# 4. Review code history
"GitHub: show recent PRs that modified authentication code"
"GitHub: search for TODOs in auth-related files"

# 5. Create tracking issue
"Create a Linear issue for the authentication error spike"

# 6. After fixing
"Update Linear issue LIN-456 as completed with the fix details"
"GitHub: create PR with fix referencing the Linear issue"
```

## Advanced Integration Examples

### Research & Implementation
```bash
# Deep technical research
"DeepWiki: explain event loop and microtasks in JavaScript"
"Context7: show me Bun.js performance optimization docs"
"GitHub: find examples of WebSocket implementations in our codebase"

# Error investigation
"Sentry: show errors grouped by release"
"GitHub: check if error was introduced in recent PR"
"Linear: find related bug reports"
```

### Documentation-Driven Development
```bash
# Before implementing
"Context7: React 19 new features and migration guide"
"DeepWiki: compare Virtual DOM vs Signals performance"
"GitHub: search for existing React 19 migration PRs"

# During implementation
"Context7: useOptimistic hook examples"
"GitHub: how did we handle similar migrations before?"
"Linear: update migration task with progress"
```

## Troubleshooting MCP Servers

### Connection Issues
- Verify server URLs in `.mcp.json`
- Check network connectivity
- Ensure proper authentication

### No Results
- Try broader search terms
- Check server status
- Verify permissions/scope

### Performance
- Use specific queries
- Limit result sets
- Cache frequently used data

## Remember

MCP servers extend Claude Code beyond local file operations. Use them to:
- Stay informed about production issues
- Keep project management in sync
- Access up-to-date documentation
- Make data-driven decisions

The combination of these servers provides a complete development environment within Claude Code.