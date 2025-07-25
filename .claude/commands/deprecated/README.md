# Deprecated Commands

This folder contains commands that have been superseded by more advanced agent-based implementations.

## Deprecated Commands

### /plan and /implement
**Replaced by**: The `implementation` agent

The implementation agent now handles both planning and implementation in an integrated workflow. It automatically adapts the planning depth based on task complexity:
- Simple changes get minimal planning
- Complex features get comprehensive collaborative planning
- Implementation follows immediately after planning approval

**To use the new approach**: Simply ask Claude to build/implement/create something, and the implementation agent will be automatically invoked.

## Why Keep Deprecated Commands?

These commands are preserved for:
1. Historical reference
2. Understanding the evolution of the system
3. Potential reuse of specific patterns
4. Rollback capability if needed

## Migration Guide

Instead of:
```
/plan Add user authentication
/implement Add user authentication based on the plan
```

Now just:
```
Add user authentication to the app
```

The implementation agent will handle everything automatically.