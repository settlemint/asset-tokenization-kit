# Claude Code Configuration

This directory contains configuration and commands for Claude Code, Anthropic's AI coding assistant.

## Directory Structure

```
.claude/
├── commands/          # Custom command definitions
│   ├── comments.md    # Add documentation to code
│   ├── debug.md       # Advanced debugging techniques
│   ├── deps.md        # Dependency management
│   ├── explore.md     # Project exploration guide
│   ├── performance.md # Performance optimization
│   ├── pr.md          # Pull request creation
│   ├── qa.md          # Quality assurance testing
│   ├── quick.md       # Quick reference guide
│   ├── reflection.md  # Configuration improvement
│   └── stuck.md       # Problem-solving protocol
└── README.md          # This file
```

## Commands Overview

Commands are workflow guides that Claude Code can follow to help with common development tasks.

### Using Commands

1. **Manually**: Type the command name (e.g., `/pr`) in Claude Code
2. **Automatically**: Claude Code will suggest commands based on context
3. **Reference**: Commands are comprehensive guides, not single actions

### Command Categories

- **Workflow**: `/pr`, `/qa`, `/comments`, `/explore`
- **Problem-Solving**: `/stuck`, `/debug`, `/performance`
- **Maintenance**: `/deps`, `/reflection`
- **Reference**: `/quick`

## MCP Servers

The project includes `.mcp.json` which configures Model Context Protocol servers:

- **Linear**: Project management integration
- **GitHub**: Repository operations
- **Postgres**: Database access
- **Filesystem**: Enhanced file operations

### Setup

1. Set required environment variables:
   ```bash
   export LINEAR_API_KEY="your-key"
   export GITHUB_PERSONAL_ACCESS_TOKEN="your-token"
   export DATABASE_URL="postgresql://..."
   ```

2. Servers are automatically available when running Claude Code

## Best Practices

1. **Be Specific**: Clear, detailed requests get better results
2. **Step-by-Step**: Break complex tasks into steps
3. **Explore First**: Let Claude understand the codebase before changes
4. **Use Commands**: Leverage commands for structured workflows

## Contributing

When adding new commands:
1. Follow the existing format structure
2. Include clear purpose and steps
3. Add practical examples
4. Update CLAUDE.md with the new command

## More Information

- [Claude Code Documentation](https://docs.anthropic.com/en/docs/claude-code/overview)
- [MCP Documentation](https://docs.anthropic.com/en/docs/claude-code/mcp)
- [Memory Management](https://docs.anthropic.com/en/docs/claude-code/memory)