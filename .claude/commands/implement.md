# /implement

Implement the following: $ARGUMENTS

# Explore

First, use parallel subagents to find and read all files that may be useful for
implementing the ticket, either as examples or as edit targets. The subagents
should return relevant file paths, and any other info that may be useful.

# Plan

Next, think hard and write up a detailed implementation plan. Don't forget to
include tests, lookbook components, and documentation. Use your judgement as to
what is necessary, given the standards of this repo.

If there are things you are not sure about, use parallel subagents to do some
web research. They should only return useful information, no noise.

If there are things you still do not understand or questions you have for the
user, pause here to ask them before continuing.

# Code

When you have a thorough implementation plan, you are ready to start writing
code. Follow the style of the existing codebase (e.g. we prefer clearly named
variables and methods to extensive comments). Make sure to run our
autoformatting script when you're done, and fix all tsc and linter errors and
warnings.

# Test

Use parallel subagents to run tests, and make sure they all pass. You should use
the /test command from @.claude/commands/test.md for this.

If your changes touch the UX in a major way, use the playwrite mcp to make sure
that everything works correctly. Make a list of what to test for, and use a
subagent for this step.

If your testing shows problems, go back to the planning stage and think
ultrahard.

# Review

Use the /code-review command from @.claude/commands/code-review.md to review the
code you have written and ask the user what they want to change.
