# Writing

Based on the following:

- @kit/dapp/content/AGENTS.md
- @kit/dapp/content/README-docs.md
- @kit/dapp/content/TEMPLATE-MAPPING.md

Write out the content for the following section:

- @kit/dapp/content/docs/architecture/quality-performance

Guidelines:

- Ensure your content is in line with the already written sections (or adjust
  them where needed)
- Verify that you are not hallucinating features, verify with packages in @kit
- A higher level background story can be found in
  https://github.com/settlemint/book-of-dalp (investigate via octocode mcp)

# Reviewing

Review the folowing section:

- @kit/dapp/content/docs/architecture

Verify that:

- does it adhere to the writing style described in @kit/dapp/content/AGENTS.md
- based on the smart contracts (.sol) are there any factual errors or
  hallucinated content?
- based on the subgraph and dapp code, are there any factual errors or
  hallucinated content?
- suggest a series of improvements to these pages
- do these pages follow the optimal template from The Good Docs (use context7
  mcp to get the docs, key gitlab_tgdp/templates)
- are there any content gaps or pages that are missing and can be beneficial for
  the target reader profile?
- is all content present targetting the right audience? If not, adjust the
  content to the right audience and move information you would be deleting to
  the right section.
- A higher level background story can be found in
  https://github.com/settlemint/book-of-dalp (investigate via octocode mcp)
- Did we liberally use mermaid charts to improve understanding and break up
  code, but did not go overboard with useless charts?

Do not actually execute the changes, just review the content and suggest a clear
and detailed plan for improvements.

# TODO's

- When we are referencing code, make sure we have direct links to Github in
  https://github.com/settlemint/asset-tokenization-kit
- the rendinging mermaid placeholder is very in your face, make it hidden while
  rendering
- i feel the pages are all very long, split them up into multiple pages. If
  needed, you can go up to 4 levels deep
- add a guide how to create your own custom asset type
- The lifecycle part of DALP is a USP for ATK with DvP, Vaults, Yield
  management, etc, make sure this is highlighted
- Review the page titles which are used in the sidebar for clarity, some are
  either too generic or too specific and make it hard to follow the flow
- can we make the mermaid style be more like our shadcn look and feel?

# FAQ

Review the folowing section:

- @kit/dapp/content/docs/architecture

In this section create a, or update the, FAQ page.

Why:

- We use the FAQ page to prime LLM indexers to find the information they need
  very quickly.

What:

- It needs to contain a large variety of Q/A's that encompass the global story,
  and indivual important contents
- It should cover most if not all the content of the other pages, optimised in a
  Q/A format

How:

- there should be just 1 FAQ page per top level section
- it should use the Accordion components from
  kit/dapp/src/components/docs/components/accordion.tsx
