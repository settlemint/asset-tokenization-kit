# Create a Pull Request

## Pre-flight Checks

1. **Branch Status** (CRITICAL)

   ```bash
   git branch --show-current
   ```

   - ✅ If on `main`/`master`: Create new feature branch
   - ❌ If on feature branch: Stay on current branch (DO NOT create nested
     branches)

2. **Working Directory Status**
   ```bash
   git status
   ```
   - Ensure all changes are tracked
   - No unintended files included

## Execution Steps

1. **Stage Changes**

   ```bash
   git add -A  # or selectively add files
   ```

2. **Create Semantic Commit** Format: `<type>: <description>`

   Valid types:

   - `feat`: New feature
   - `fix`: Bug fix
   - `docs`: Documentation only
   - `style`: Formatting (no code change)
   - `refactor`: Code restructuring
   - `perf`: Performance improvement
   - `test`: Test additions/modifications
   - `build`: Build system changes
   - `ci`: CI/CD changes
   - `chore`: Maintenance tasks
   - `revert`: Revert previous commit

   Special cases:

   - Dependencies: `chore(deps): update package`
   - Breaking changes: `feat!: description` or include `BREAKING CHANGE:` in
     body

3. **Push to Remote**

   ```bash
   git push -u origin <current-branch>
   ```

4. **Create Pull Request** Use `gh pr create` with comprehensive description:

   - **Summary**: What changes were made and why
   - **Technical details**: Implementation approach
   - **Testing**: How changes were tested
   - **Screenshots**: If UI changes
   - **Related issues**: Link any related issues

5. **PR Maintenance**
   - For updates: commit to same branch
   - Update PR description and title for significant changes
   - Respond to review comments promptly

## Example PR Creation

```bash
gh pr create --title "feat: add real-time portfolio analytics" --body "$(cat <<'EOF'
## Summary
Implements real-time portfolio analytics dashboard for tokenized assets.

## Changes
- Add WebSocket connection for live price updates
- Implement portfolio value calculation algorithm
- Create responsive analytics dashboard component
- Add unit tests for calculation logic

## Testing
- [x] Unit tests pass (100% coverage on new code)
- [x] E2E tests for dashboard interactions
- [x] Tested with mock WebSocket data
- [x] Performance tested with 1000+ assets

## Screenshots
[Dashboard screenshot here]

## Related Issues
Closes #123
EOF
)"
```

## Post-Creation Checklist

- [ ] PR title follows semantic commit format
- [ ] Description explains the "why" not just the "what"
- [ ] All tests pass locally
- [ ] No merge conflicts with target branch
- [ ] Linked to relevant issues
- [ ] Requested appropriate reviewers
