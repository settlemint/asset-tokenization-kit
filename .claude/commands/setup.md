# /setup

Configure MCP servers.

## MCP Server Setup

```bash
# Check existing
claude mcp list

# Add recommended servers
claude mcp add --transport sse linear https://mcp.linear.app/sse -s user
claude mcp add --transport sse context7 https://mcp.context7.com/sse -s user
claude mcp add --transport sse deepwiki https://mcp.deepwiki.com/sse -s user
claude mcp add --transport http sentry https://mcp.sentry.dev/mcp -s user
claude mcp add playwright npx '@playwright/mcp@latest' -s user
claude mcp add gemini-cli -- npx -y gemini-mcp-tool -s user
claude mcp add --transport http grep https://mcp.grep.app -s user
claude mcp add -t http OpenZeppelinSolidityContracts https://mcp.openzeppelin.com/contracts/solidity/mcp -s user

# Verify
claude mcp list
```
