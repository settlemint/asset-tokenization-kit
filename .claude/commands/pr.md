# Create a PR

1. **Check current branch first**:
   - Run `git branch --show-current` to see which branch you're on
   - If on main/master branch: create a new feature branch
   - If already on a feature branch: DO NOT create another branch, use the current one
2. Commit all changes and new files with a clear and concise one-line commit
   message, using semantic commit notation. Without scope in the format: <type>:
   <description> where type is fix/feat/chore/docs. Include a body if needed for
   context but no breaking changes.
3. Push the changes to the remote repository (to the current branch).
4. Create a pull request to the main branch, make sure to explain the full scope
   of the changes in this branch
5. For any follow up changes, update the PR description with the new changes.
