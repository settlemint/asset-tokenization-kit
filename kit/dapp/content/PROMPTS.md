# Writing

Based on the following:

- @kit/dapp/content/AGENTS.md
- @kit/dapp/content/README-docs.md
- @kit/dapp/content/TEMPLATE-MAPPING.md

Write out the content for the following section:

- @kit/dapp/content/docs/developer-guides

Guidelines:

- Ensure your content is in line with the already written sections (or adjust
  them where needed)
- Verify that you are not hallucinating features, verify with packages in @kit
- Be very precise in your wording, locations of files and code snippets,
  developers will use this and should be able to use the docs as is

- A higher level background story can be found in
  <https://github.com/settlemint/book-of-dalp> (investigate via octocode mcp)

- Add clear placeholders for where screenshots should be included, do this by
  creating and setting one placeholder image (put it in the repo) and describing
  the content in the image caption

# Reviewing

Review the folowing section:

- @kit/dapp/content/docs/developer-guides

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
  <https://github.com/settlemint/book-of-dalp> (investigate via octocode mcp)
- Did we liberally use mermaid charts to improve understanding and break up
  code, but did not go overboard with useless charts?

Do not actually execute the changes, just review the content and suggest a clear
and detailed plan for improvements.

# TODO's

- When we are referencing code, make sure we have direct links to Github in
  <https://github.com/settlemint/asset-tokenization-kit> add this directive to
  kit/dapp/content/AGENTS.md as well
- i feel the pages are all very long, split them up into multiple pages. If
  needed, you can go up to 4 levels deep
- add a guide how to create your own custom asset type

- can we make the mermaid style be more like our shadcn look and feel? add this
  directive to kit/dapp/content/AGENTS.md as well
- We have several special components we can use to improve the look and feel of
  the docs ...TabsComponents, AccordionComponents, BannerComponents,
  CodeBlockComponents, FilesComponents,StepsComponents, and the default
  components like cards. Use them where a) relevant and b) they enhance the
  readers experience. Do not go overboard, readability is crucial. add this
  directive to kit/dapp/content/AGENTS.md as well
- use org mode to get info from slack
- update agents with the good docs templates to use for what

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
- There can be some, but not too much overlap between the FAQ pages, but
  language will be different as the sections have different writing styles and
  target audidiences

How:

- there should be just 1 FAQ page per top level section
- think on how the target audience of this section would ask LLM's for
  information we want to provide.
- it should use the Accordion components from
  kit/dapp/src/components/docs/components/accordion.tsx
- add this directive to kit/dapp/content/AGENTS.md as well

# Glossary

Review the folowing section:

- @kit/dapp/content/docs/architecture

In this section create a, or update the, Glossary page.

Why:

- The glossary page is a way to have a reference to concepts used in the docs.

What:

- It needs to contain all concepts used in this section
- There can be some, but not too much overlap between the Glossary pages, but
  language will be different as the sections have different writing styles and
  target audidiences

How:

- there should be just 1 Glossary page per top level section
- it should use the Accordion components from
  kit/dapp/src/components/docs/components/accordion.tsx
- add this directive to kit/dapp/content/AGENTS.md as well
