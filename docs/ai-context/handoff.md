# Task Management & Handoff Template

This file manages task continuity, session transitions, and knowledge transfer for AI-assisted development sessions on the SettleMint Asset Tokenization Kit.

## Purpose

This template helps maintain:
- **Session continuity** between AI development sessions
- **Task status tracking** for complex, multi-session work
- **Context preservation** when switching between team members
- **Knowledge transfer** for project handoffs
- **Progress documentation** for ongoing development efforts

## Current Session Status

### Active Tasks
Document currently in-progress work:

```markdown
## In Progress
- [ ] Task 1: [Brief description]
  - Status: [Started/Blocked/Awaiting review]
  - Context: [Relevant files, decisions made]
  - Next steps: [What needs to be done next]
  - Dependencies: [What this task depends on]

- [ ] Task 2: [Brief description]
  - Status: [Current status]
  - Files modified: [List of files changed]
  - Challenges: [Any issues encountered]
  - Notes: [Important context for continuation]
```

### Pending Tasks
Document queued work:

```markdown
## Pending
- [ ] Task A: [Description]
  - Priority: [High/Medium/Low]
  - Dependencies: [What must be completed first]
  - Estimated effort: [Time estimate]
  - Context: [Background information]

- [ ] Task B: [Description]
  - Priority: [Priority level]
  - Requirements: [Specific requirements or constraints]
  - Resources needed: [Tools, access, information needed]
```

### Completed Tasks
Track completed work for context:

```markdown
## Completed This Session
- [x] Task X: [Description]
  - Completed: [Date]
  - Outcome: [What was accomplished]
  - Files changed: [Modified files]
  - Notes: [Important decisions or lessons learned]

- [x] Task Y: [Description]
  - Completed: [Date]
  - Impact: [How this affects other tasks]
  - Follow-up needed: [Any follow-up actions required]
```

## Architecture & Design Decisions

### Recent Decisions
Document architectural decisions made during development:

```markdown
## Design Decisions Made
- **Decision**: [What was decided]
  - Date: [When decision was made]
  - Rationale: [Why this approach was chosen]
  - Alternatives considered: [Other options evaluated]
  - Impact: [How this affects the system]
  - Validation: [How to verify this was the right choice]

- **Decision**: [Another decision]
  - Context: [Situation that led to this decision]
  - Trade-offs: [What was gained/lost with this choice]
  - Dependencies: [What this decision depends on]
```

### Technical Debt & Issues
Track technical debt and known issues:

```markdown
## Technical Debt Identified
- **Issue**: [Description of technical debt]
  - Location: [Where in codebase]
  - Impact: [How it affects development/performance]
  - Proposed solution: [How to address it]
  - Priority: [When should this be addressed]

- **Issue**: [Another issue]
  - Root cause: [Why this debt exists]
  - Workaround: [Current mitigation strategy]
  - Long-term fix: [Proper solution approach]
```

## Asset Tokenization Kit Specific Context

### Smart Contract Tasks
```markdown
## Contract Development
- [ ] Deploy new asset type: [Bond/Equity/Fund/Deposit/StableCoin]
  - Requirements: [Specific features needed]
  - Compliance modules: [Required compliance checks]
  - Testing: [Test scenarios to cover]

- [ ] Update SMART compliance: [Description]
  - Modules affected: [List modules]
  - Impact on existing tokens: [Backward compatibility]
```

### Frontend Development
```markdown
## DApp Features
- [ ] Add new asset creation form: [Asset type]
  - Routes: [New routes to add]
  - Components: [UI components needed]
  - ORPC tasks: [Server functions required]
  - Localization: [Languages to support]

- [ ] Update portfolio view: [Description]
  - Data requirements: [GraphQL queries]
  - UI changes: [Component modifications]
```

### Infrastructure Tasks
```markdown
## Deployment & DevOps
- [ ] Update Docker Compose: [Service to add/modify]
  - Configuration: [Environment variables]
  - Dependencies: [Service dependencies]
  - Testing: [How to verify]

- [ ] Helm chart modification: [Component]
  - Values to add: [Configuration options]
  - Resource limits: [CPU/Memory requirements]
```

## Next Session Goals

### Immediate Priorities
Define what should be tackled next:

```markdown
## Next Session Priorities
1. **Primary Goal**: [Main objective for next session]
   - Success criteria: [How to know this is complete]
   - Prerequisites: [What must be ready beforehand]
   - Estimated effort: [Time estimate]

2. **Secondary Goal**: [Secondary objective]
   - Dependencies: [What this depends on]
   - Resources needed: [Tools, information, access required]

3. **If Time Permits**: [Optional tasks]
   - Context: [Background on why these are valuable]
   - Preparation: [What needs to be done to start these]
```

### Knowledge Gaps
Document areas needing research or clarification:

```markdown
## Knowledge Gaps to Address
- **Question**: [What needs to be clarified]
  - Impact: [How this affects current work]
  - Research needed: [What investigation is required]
  - Decision maker: [Who can answer this]

- **Unknown**: [Technical uncertainty]
  - Options: [Possible approaches to explore]
  - Experiments: [What should be tested]
  - Timeline: [When this needs to be resolved]
```

## Context for Continuation

### Key Files & Components
Document important files for session continuity:

```markdown
## Files Currently Being Modified
- `kit/contracts/contracts/assets/[asset-type]/`: [Current contract work]
- `kit/dapp/src/routes/`: [Frontend routes being added]
- `kit/dapp/src/tasks/`: [ORPC tasks in development]
- `kit/subgraph/src/`: [Subgraph mappings updated]

## Important Context Files
- `/CLAUDE.md`: [Project guidelines and standards]
- `/docker-compose.yml`: [Local development setup]
- `/kit/charts/atk/values.yaml`: [Deployment configuration]
```

### Development Environment
Document environment and setup considerations:

```markdown
## Environment Status
- **Docker Compose**: [Running services, any issues]
- **Database**: [Schema changes, migrations, data state]
- **Blockchain**: [Deployed contracts, network state]
- **Testing**: [Test suite status, coverage, failing tests]
- **Build/Deploy**: [Build status, deployment considerations]
```

### Common Commands Reference
Quick reference for Asset Tokenization Kit:

```bash
# Development
bun run dev:up          # Start Docker services
bun run dev:reset       # Clean restart
bun run dev            # Start dev server
bun run artifacts      # Generate contract artifacts

# Testing
bun run test           # Unit tests
bun run test:e2e:ui    # UI tests
bun run test:e2e:api   # API tests

# Quality Assurance
bun run ci             # Full CI suite
bun run lint           # Linting
bun run format         # Code formatting
```

---

*This template is specifically tailored for the SettleMint Asset Tokenization Kit. Update it with actual task information during development sessions to maintain continuity.*