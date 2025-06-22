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

#### Debugging Workflow
1. Check for recent errors related to current issue
2. Analyze error patterns and frequency
3. Review stack traces and affected users
4. Correlate with recent deployments

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

#### Issue Management Workflow
1. Check existing issues before creating duplicates
2. Link code changes to Linear issues
3. Update issue status as work progresses
4. Add implementation notes to issues

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

#### Documentation Lookup Workflow
1. Search for official documentation first
2. Look for code examples and best practices
3. Check version-specific information
4. Find migration guides when updating

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

# 3. Get documentation
"Find Next-Auth.js error handling documentation from Context7"

# 4. Create tracking issue
"Create a Linear issue for the authentication error spike"

# 5. After fixing
"Update Linear issue LIN-456 as completed with the fix details"
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