## Model Selection

**Default Model**: [opus/sonnet] - [Reason for default choice]

### When to Use Opus

- [Specific condition 1 requiring deep reasoning]
- [Specific condition 2 requiring security analysis]
- [Specific condition 3 requiring complex problem solving]

### When to Use Sonnet

- [Standard pattern implementation]
- [Well-defined task with clear requirements]
- [Time-sensitive or high-volume operations]

### Model Override Examples

```yaml
# Complex task requiring Opus
task: "Design new authentication system with multi-factor support"
model: opus
reason: "Security-critical architecture decisions"

# Simple task suitable for Sonnet
task: "Add loading spinner to form submission"
model: sonnet
reason: "Standard UI pattern implementation"
```

### Parallel Execution Optimization

When running in parallel with other agents:

- Use Sonnet for faster response times if task complexity allows
- Reserve Opus for critical path items that block other agents
- Consider token budget when multiple agents use Opus simultaneously
