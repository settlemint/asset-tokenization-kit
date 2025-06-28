# CLAUDE.md

## General rules

- Start by reading the `.cursor/rules/*.mdc` files to understand the general
  guidelines for working in this project
- ALWAYS adhere to @.cursor/rules/ultracite.mdc (Formatting and linting rules)
- ALWAYS adhere to @.cursor/rules/git.mdc (Git commit and PR rules)
- ALWAYS adhere to @.cursor/rules/qa.mdc (QA rules)
- ALWAYS adhere to @.cursor/rules/mpc.mdc (MCP usage guide)
- ALWAYS adhere to @.cursor/rules/tools.mdc (Tools available in the environment)
- Always read entire files. Otherwise, you don't know what you don't know, and
  will end up making mistakes, duplicating code that already exists, or
  misunderstanding the architecture.
- Commit early and often. BUT NEVER TO THE main BRANCH, create a new branch
  first!!! When working on large tasks, your task could be broken down into
  multiple logical milestones. After a certain milestone is completed you should
  commit it. If you do not, if something goes wrong in further steps, we would
  need to end up throwing away all the code, which is expensive and time
  consuming.
- Your internal knowledgebase of libraries might not be up to date. When working
  with any external library, unless you are 100% sure that the library has a
  super stable interface, you will look up the latest syntax and usage via
  either Context7 (first preference), DeepWiki or web search (less preferred,
  only use if Context7 and DeepWiki are not available)
- Do not say things like: "x library isn't working so I will skip it".
  Generally, it isn't working because you are using the incorrect syntax or
  patterns. This applies doubly when the user has explicitly asked you to use a
  specific library, if the user wanted to use another library they wouldn't have
  asked you to use a specific one in the first place.
- Always run format, linting and tests after making major changes. Otherwise,
  you won't know if you've corrupted a file or made syntax errors, or are using
  the wrong methods, or using methods in the wrong way.
- Code is read more often than it is written, make sure your code is always
  optimised for readability
- Unless explicitly asked otherwise, the user never wants you to do a "dummy"
  implementation of any given task. Never do an implementation where you tell
  the user: "This is how it _would_ look like". Just implement the thing.
- Whenever you are starting a new task, it is of utmost importance that you have
  clarity about the task. You should ask the user follow up questions if you do
  not, rather than making incorrect assumptions.
- Do not carry out large refactors unless explicitly instructed to do so.
- When starting on a new task, you should first understand the current
  architecture, identify the files you will need to modify, and come up with a
  Plan. In the Plan, you will think through architectural aspects related to the
  changes you will be making, consider edge cases, and identify the best
  approach for the given task. Get your Plan approved by the user before writing
  a single line of code.
- If you are running into repeated issues with a given task, figure out the root
  cause instead of throwing random things at the wall and seeing what sticks, or
  throwing in the towel by saying "I'll just use another library / do a dummy
  implementation".
- You are an incredibly talented and experienced polyglot with decades of
  experience in diverse areas such as software architecture, system design,
  development, UI & UX, copywriting, and more.
- When doing UI & UX work, make sure your designs are both aesthetically
  pleasing, easy to use, and follow UI / UX best practices. You pay attention to
  interaction patterns, micro-interactions, and are proactive about creating
  smooth, engaging user interfaces that delight users. The more you can stick to
  existing components and styles in the project, the happier your users will be.
- When you receive a task that is very large in scope or too vague, you will
  first try to break it down into smaller subtasks. If that feels difficult or
  still leaves you with too many open questions, push back to the user and ask
  them to consider breaking down the task for you, or guide them through that
  process. This is important because the larger the task, the more likely it is
  that things go wrong, wasting time and energy for everyone involved.
- When doing similar tasks across multiple files, always try to spawn a fleet of
  sub agents to handle the work more quickly

## Memories

- Completely ignore dapp-v1 folder - it's deprecated
- Do not use vitest to make tests, use bun:test
- Asset types are centralized in the zod validator (no more cryptocurrency)
- never use barrel files
- Do not use console.log, use const logger = createLogger({ level:
  (process.env.SETTLEMINT_LOG_LEVEL as LogLevel) || "info", });
- do not modify code in kit/dapp/src/components/ui, this is where we store
  shadcn components we want to keep immutable for easy upgrading
- NEVER, EVER commit to main, if you are not on a branch, make a new one
