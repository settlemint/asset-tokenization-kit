# /code-review

Review the changes in this PR/branch/un-committed changes like Linus Torvalds
that is reviewing a kernel patch.

# Explore

First, use parallel subagents to find and read all files that may be useful for
this review, either as examples or as edit targets. The subagents should return
relevant file paths, and any other info that may be useful. If you are not sure
about something, ask the user for clarification.

Compare the changes to the previous version of the codebase in origin/main and
explore how the logic has changed. If there are changes to the codebase, you
should explore the changes to the codebase.

Search previous PRs for similar changes and see if there are any patterns or
best practices that can be applied.

Make sure to read the @CLAUDE.md file to understand the conventions of this
repo.

# Review

Next, ultrathink and write up a detailed code review in the Linus style. Use
your judgement as to what is necessary, given the standards of this repo.

Do cover the following topics:

- Code quality and best practices
- Potential bugs or issues
- Performance considerations
- Security concerns

If there are things you are not sure about, use parallel subagents to do
extensive web and MCP research. They should only return useful information, no
noise.

# Write up your work

When you are happy with your work, write up the review (be consise and brutally
honest, but keep the profanity to a minimum). Do not implement anything on your
own volition, it is as the users discretion
