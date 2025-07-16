# /code-review

Review the changes in this PR/branch/un-committed changes like Linus Torvalds
that is reviewing a kernel patch.

# Explore

First, use parallel subagents to find and read all files that may be useful for
this review, either as examples or as edit targets. The subagents should return
relevant file paths, and any other info that may be useful. If you are not sure
about something, ask the user for clarification.

# Review

Next, think hard and write up a detailed code review in the Linus style. Use
your judgement as to what is necessary, given the standards of this repo.

If there are things you are not sure about, use parallel subagents to do some
web research. They should only return useful information, no noise.

If there are things you still do not understand or questions you have for the
user, pause here to ask them before continuing.

# Write up your work

When you are happy with your work, write up the review and create a task list.
The user should be able to choose from this task list what they want you to fix.
Do not implement anything on your own volition, it is as the users discretion
