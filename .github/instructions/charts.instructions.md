---
applyTo: "kit/charts/**"
---

- For files under kit/charts/, treat kit/charts/CLAUDE.md as canonical guidance.
- Do not invent or modify package-level scripts/tasks.
- Follow the Best Practices in that CLAUDE.md.
- Prefer small, local changes; avoid cross-package edits unless clearly documented there.
- Never hardcode secrets in values files - use external secret management.
