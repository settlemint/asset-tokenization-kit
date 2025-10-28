## Style Guide for Content Creation (for AI Writers)

To ensure the documentation is consistent, clear, and high quality, we provide
the following **style guidelines** for any AI agent or writer generating the
content. The goal is to combine _engaging, human-like writing_ with technical
accuracy and clarity, optimized for both human readers and AI search indexing.

### Writing Tone and Voice

- **Audience-Appropriate Tone:** Adjust tone based on the persona and section:
- _Part I (Executive Overview):_ Use a **conversational yet professional tone**.
  It should be engaging and persuasive, touching on pain points emotionally
  (e.g., "Imagine a world where settlement takes seconds, not days…"). Avoid
  heavy jargon; explain concepts in simple terms. A bit of marketing flair is
  welcome but stay factual (no hype). For example, empathize with the reader's
  challenges and then show enthusiasm for the solution.
- _Part II (Architecture & Capabilities):_ A **more formal and precise tone**.
  Still clear and approachable, but assume a technical reader. Use correct
  terminology and be straightforward. This content can be more explanatory and
  didactic in style, focusing on understanding.
- _Part III (User Guides):_ **Instructional and reassuring tone.** Use second
  person ("you") to directly guide the user through steps. Keep it encouraging,
  e.g., "Now you'll see a confirmation message…". Avoid blaming the user for
  mistakes. If something might be tricky, use a friendly warning ("Note: if you
  don't see X, check that you clicked Y.").
- _Part IV (Developer docs):_ **Technical and concise tone.** It's okay to use
  technical terms and be a bit more dry here, but still aim for clarity over
  showing off vocabulary. Use imperative mood for instructions ("Run the
  command…") and factual descriptions. Ensure no ambiguity in steps.
- _Part V (Appendices & Roadmap):_ **Mixed tone.** Glossary and FAQ should be
  straightforward and accessible to all. Release notes can be matter-of-fact.
  Roadmap might revert to a slightly visionary tone but with cautionary language
  to not over-promise.
- **Engaging and Human-Like:** In all parts, strive for a natural flow. Use
  first and second person pronouns where appropriate (e.g., "we" when referring
  to the development team or platform capabilities in a friendly way, "you" for
  the reader). Include occasional rhetorical questions or colloquial phrases to
  keep it lively, _especially in Part I_ (e.g., "You might wonder, why hasn't
  this been solved already? Well, …"). Be careful not to overdo it or sound
  flippant.
- **Clarity and Simplicity:** Favor clear, direct sentences. Avoid unnecessary
  passive voice. For example, instead of "The tokenization of assets is achieved
  by the platform," say "The platform tokenizes assets". Keep sentences
  grammatically simple where possible to aid non-native English
  readers[\[135\]](https://cookbook.openai.com/articles/what_makes_documentation_good#:~:text=well)[\[136\]](https://cookbook.openai.com/articles/what_makes_documentation_good#:~:text=Be%20broadly%20helpful).
  However, vary sentence length for flow - some short, some longer as needed for
  explanation (avoiding monotony).
- **Avoid Jargon Overload:** Define terms on first use or in the glossary. Don't
  assume the reader knows all acronyms. For a business reader, explain technical
  terms in plain language ("multi-signature (multisig) wallets - which require
  multiple approvals for a transaction"). For technical parts, it's fine to use
  acronyms after defining them.
- **Emotional and Cultural Nuance:** Particularly in Part I, gently tap into the
  reader's feelings: frustration with current systems, excitement for
  innovation, concern for security. Use mild emotional language like "friction,"
  "pain points," "confidence," "peace of mind." Ask a rhetorical question
  occasionally to engage ("Tired of juggling multiple systems for one asset
  issuance? ATK is built to change that."). **Use emotional cues sparingly** in
  technical sections - a bit of excitement is okay when introducing a feature,
  but stay credible.
- **Consistency:** Use consistent terminology (don't switch between "investor"
  and "user" randomly if meaning the same role; stick to one term per context).
  Follow capitalization rules for product names (Asset Tokenization Kit (ATK)
  should be consistent). Use Title Case for headings if that's the chosen style
  throughout to avoid any "huh, that's weird" moments for
  readers[\[137\]](https://cookbook.openai.com/articles/what_makes_documentation_good#:~:text=Be%20consistent,the%20content%2C%20not%20its%20inconsistencies).
  If we use contractions like "can't, won't" in narrative parts, continue that
  style; probably keep user guides more straightforward ("cannot" is fine there,
  but not a big issue either way - consistency is key).
- **Avoid Marketing Buzzwords:** While we want an engaging style, avoid empty
  buzzphrases and the banned words from AGENTS guidelines. For instance, do
  _not_ use words like "unlock" or "game-changing" or clichés like "end-to-end
  solution" that were
  flagged[\[138\]](https://github.com/settlemint/book-of-dalp/blob/ac9b43701dce421ccef78597d830f183247d65f4/AGENTS.md#L36-L44).
  Focus on concrete benefits instead of superlatives (e.g., say "automates
  compliance checks" rather than "revolutionary compliance capabilities").

### Structure and Formatting

- **Headings:** Use a clear heading hierarchy to make content
  skimmable[\[139\]](https://cookbook.openai.com/articles/what_makes_documentation_good#:~:text=Make%20docs%20easy%20to%20skim).
  Each page should start with its H1 title (from the metadata). Inside pages,
  use H2 for major sections, H3 for subsections, etc. Headings should be
  descriptive (informative) rather than
  generic[\[140\]](https://cookbook.openai.com/articles/what_makes_documentation_good#:~:text=Split%20content%20into%20sections%20with,focus%20in%20or%20move%20on).
  For example, prefer "**Compliance by design in SMART contracts**" over just
  "**Compliance**". This helps readers (and AI search) know what's in that
  section at a glance.
  - **Title Capitalization:** Use sentence case for all headings (capitalize
    only the first word and proper nouns), not title case. Examples:
    - ✅ Correct: "Frontend layer: Web application & mobile interface"
    - ❌ Incorrect: "Frontend Layer: Web Application & Mobile Interface"
    - ✅ Correct: "Why this architecture beats point tools"
    - ❌ Incorrect: "Why This Architecture Beats Point Tools"
    - Proper nouns are always capitalized: "SMART Protocol", "OnchainID",
      "PostgreSQL", "Kubernetes"
- **Paragraphs:** Keep paragraphs short (ideally 2-4 sentences
  each)[\[141\]](https://cookbook.openai.com/articles/what_makes_documentation_good#:~:text=Keep%20paragraphs%20short,Long%20paragraphs%20can%20bury%20information).
  One idea per paragraph. If a sentence is very important, it can stand as its
  own one-sentence paragraph for emphasis. Long walls of text are to be avoided
  to prevent reader fatigue.
- **Lists and Tables:** Use **bulleted or numbered lists** liberally to break
  out steps, features, or important
  points[\[142\]](https://cookbook.openai.com/articles/what_makes_documentation_good#:~:text=Use%20bullets%20and%20tables,Use%20them%20frequently).
  For procedures, use numbered lists for each step. For collections of items or
  features, bullet points are great. Ensure list items are parallel in structure
  (all start with a verb, for instance, if they are steps). Use **tables** when
  comparing things (like the feature matrix for asset types, or listing data
  fields vs description in reference pages) to improve skimmability.
  - **Table Formatting Rules:**
    - Always place tables on their own lines, not inline after text
    - Separate the table header from preceding content with a blank line
    - ✅ Correct: `**Header:**\n\n| Col1 | Col2 |\n|------|------|\n| A | B |`
    - ❌ Incorrect: `**Header:** | Col1 | Col2 |\n|------|------|\n| A | B |`
    - Each row must be on its own line
    - Use consistent spacing in separator row (e.g.,
      `|------|------| not |--|--|`)
- **Emphasis:** Use **bold** to highlight key terms or the first instance of
  important concepts (the OpenAI doc suggests bolding important text to help
  find
  answers[\[143\]](https://cookbook.openai.com/articles/what_makes_documentation_good#:~:text=Bold%20important%20text,to%20help%20readers%20find%20it)).
  For example, "**ERC-3643** is the security token standard that ensures
  compliance…" It draws attention to the term being defined. Use _italic_
  sparingly, maybe for occasional emphasis or example scenario framing. Avoid
  all-caps or excessive punctuation for emphasis.
- **Mermaid Diagrams:** Incorporate **Mermaid diagrams** frequently to
  illustrate architectures, workflows, and processes. Each diagram should be
  introduced by the text explaining what it depicts. Ensure the diagram has a
  title or caption in the Mermaid code if possible (or at least a clear label in
  the text). Variety of diagrams: flowcharts for processes (e.g. KYC process
  flow), pie or bar charts if quantitative, but mostly sequence diagrams and
  graphs as we have architecture and flows. This not only breaks monotony but
  also serves visual learners. Aim for at least one diagram per major page if it
  aids understanding, as a picture is worth a thousand words. However, diagrams
  must be accurate - base them on the architecture described (for instance,
  reuse structure from provided diagrams in the source docs to avoid inventing
  incorrect flows).
  - **CRITICAL: Use `<Mermaid>` component, NOT markdown code blocks:**
    - ✅ Correct: `<Mermaid chart={\`flowchart TB\n A --> B\`} />`
    - ❌ Incorrect: ` ```mermaid\nflowchart TB\n  A --> B\n``` `
    - The `chart` prop contains the Mermaid diagram code as a template string
    - Use single quotes for the prop if diagram contains backticks:
      `<Mermaid chart={'flowchart TB\n  A --> B'} />`
    - Always use self-closing tag `/>` at the end
  - **Mermaid Color Standards:** Use brand-aligned colors that work in both
    light and dark themes:
    - **Success/positive states**:
      `fill:#10b981,stroke:#047857,stroke-width:2px,color:#fff` (emerald green)
    - **Error/warning/problematic states**:
      `fill:#d97706,stroke:#92400e,stroke-width:2px,color:#fff` (amber/orange)
    - **Neutral/informational elements**:
      `fill:#0ea5e9,stroke:#0369a1,stroke-width:2px,color:#fff` (sky blue)
    - **Secondary/supporting elements**:
      `fill:#8b5cf6,stroke:#6d28d9,stroke-width:2px,color:#fff` (violet)
    - Always use white text (`color:#fff`) on colored backgrounds for contrast
  - **Mermaid Layout:** Prefer vertical (`TB` or `TD`) layouts over horizontal
    (`LR`) for better readability in documentation. Use `flowchart TB` instead
    of `flowchart LR` to create taller, narrower diagrams that fit better in
    content columns.
  - **Character Encoding in Mermaid AND Regular Text:** Special characters must
    be properly encoded to avoid MDX parsing errors:
    - **CRITICAL: Use `&lt;` instead of `<` everywhere** (less than symbol)
    - **CRITICAL: Use `&gt;` instead of `>` everywhere** (greater than symbol)
    - Use `&amp;` instead of `&` (ampersand)
    - **This applies to ALL content, not just Mermaid diagrams**
    - MDX can interpret `<` as JSX tag opening, even in regular text
    - **CRITICAL: Node IDs cannot start with numbers** - always prefix with text
    - Node IDs must start with a letter, `$`, or `_`
    - **CRITICAL: Multi-line node labels cannot start second line with a
      number**
    - Example: Write `Step1` not `1Step` or `1`
    - Example: Write `Target: &lt;2s` instead of `Target: <2s`
    - Example: Write `Cost: &lt;200,000 gas/tx` instead of
      `Cost: <200,000 gas/tx`
    - Example: Write `Config["1. Configure"]` not `1["Configure"]`
    - ✅ Correct: `Supply["Total Supply: 1M tokens"]` (single line with number)
    - ❌ Incorrect: `Supply["Total Supply\n1,000,000 tokens"]` (number starts
      second line)
    - ✅ Correct: `Mobile (&lt;768px)` in regular text
    - ❌ Incorrect: `Mobile (<768px)` in regular text
  - **Version Numbers in Content:** When mentioning library versions in text
    (not in Mermaid diagrams), MDX parsers may interpret `v` followed by numbers
    as problematic syntax. Use "version X.Y" instead of "vX.Y":
    - ✅ Correct: `(version 1.133)` or `(version 5.90)`
    - ❌ Incorrect: `(v1.133)` or `(v5.90)`
    - This applies to all content, not just Mermaid diagrams
- **Images/Screenshots:** Where actual UI screenshots become available, include
  them with appropriate figure captions. For now, plan for them (like
  "Screenshot: Asset creation form") so an AI can insert later when generating
  with access to an environment. Always accompany images with alt text (or
  figure description) that describes what's in the image (for accessibility and
  for AI search context).
- **Code Blocks:** In developer sections, use Markdown code fencing for code
  snippets or CLI commands. Label them if possible (e.g., "solidity" for
  contract code, "bash" for shell commands, "\`json" for JSON outputs) to enable
  syntax highlighting. Inside how-to steps, if referencing a command, put it in
  monospace () or as a block if it's a standalone step. Keep code examples short
  and focused on the point (for instance, don't paste a whole contract, just the
  relevant function). If output is shown, maybe truncate irrelevant parts. Also,
  **explain code** either in preceding text or comments within the snippet so
  readers know what they're looking at.
- **Internal Cross-References:** Encourage linking between pages. E.g. if a user
  guide mentions "compliance module", link the text to the compliance system
  page in Part II. Or from developer guide referencing "see
  [API Reference](../api-reference) for full endpoint details." This improves
  navigation and also helps SEO/AI by connecting related content.
- **Frontmatter Metadata:** Each page must start with its YAML frontmatter
  containing:
  - **title**: Short title for sidebar navigation (2-3 words, e.g., "Corporate
    bonds")
  - **pageTitle**: Full descriptive title for the page header and browser title
    (e.g., "Corporate bond issuance for capital markets")
  - **description**: One-line description (<160 chars ideally) for SEO meta
    description, containing keywords for search
  - **tags**: 3-6 keywords, all lowercase, that broadly cover the page topics
    (to feed the site's search indexing and help AI find context)
  - Example:
    ```yaml
    ---
    title: Corporate bonds
    pageTitle: Corporate bond issuance for capital markets
    description: Automated bond lifecycle from issuance to redemption
    tags: [use-case, bonds, debt, capital-markets, automation]
    ---
    ```
- **SEO and AI Optimization:**
- Include relevant keywords naturally in the content and headings. For example,
  the page about compliance should mention "KYC/AML", "regulatory compliance"
  multiple times in a meaningful way, since that's what someone might query.
- Use clear, descriptive link text for cross-refs ("Smart Contract Reference"
  rather than "click here").
- Write each page so that the first paragraph is a quick summary of what the
  reader will learn - good for snippet/previews.
- Follow the Ahrefs AI search checklist items where applicable (e.g.,
  _informative headings_, _short paragraphs_, _structured data via
  lists/tables_, etc., many of which we've
  covered)[\[139\]](https://cookbook.openai.com/articles/what_makes_documentation_good#:~:text=Make%20docs%20easy%20to%20skim)[\[141\]](https://cookbook.openai.com/articles/what_makes_documentation_good#:~:text=Keep%20paragraphs%20short,Long%20paragraphs%20can%20bury%20information).
- Ensure content directly answers common questions in each area (this ties into
  making it AI-answer friendly - if someone asks "How does ATK ensure regulatory
  compliance?", the relevant page's text should contain a sentence like "ATK
  ensures regulatory compliance by embedding KYC/AML rules into the smart
  contracts (via the ERC-3643 standard) so that any token transfer is
  automatically checked against eligibility
  criteria[\[23\]](https://github.com/settlemint/asset-tokenization-kit/blob/7481452d8fd7b498b9c493fd9f5cd6cc63379c71/kit/docs/content/docs/02-smart-protocol-foundation.md#L5-L13)."
  This way, an AI could quote it easily).
- **Accessibility and Inclusivity:** Write with accessibility in mind:
- Use simple language wherever possible so that machine readers and translation
  can work better.
- Provide text alternatives to visual content (explain diagrams in text).
- No use of gendered language or assumptions about the user (e.g., don't assume
  the user is a "he" or technical - address "the user" or "you" neutrally).
- Avoid idioms or cultural references that might not translate (or if used,
  ensure they are understandable by context).
- The AGENTS.md also lists some specific accessibility rules for UI code (like
  alt text, no &lt;blink&gt;
  etc.)[\[144\]](https://github.com/settlemint/book-of-dalp/blob/ac9b43701dce421ccef78597d830f183247d65f4/AGENTS.md#L69-L77),
  which may not directly apply to prose, but our content should support
  accessibility by being well-structured and using semantic markup (headings,
  lists, etc. which we are doing).

### Content Development Process (Plan to Complete)

To successfully produce this large volume of content with accuracy and quality,
we propose the following plan for the AI (or documentation team):

- **Gather Source Material:** Start by collecting all existing documentation
  from the codebase (as we have done) - including technical docs in kit/docs/,
  relevant README files, and the Book of DALP content. Also gather any design
  documents or specs available. This ensures we have factual details to draw
  from for each page. _We have identified where crucial info resides (and
  provided references in the outline above). The AI writer should refer to those
  sources when writing each page to ensure technical correctness and to pull in
  necessary details._ For example, when writing the SMART Protocol page, use
  content from 02-smart-protocol-foundation.md and even copy key diagrams from
  there.
- **Follow the Outline Rigorously:** Use the structure above as a blueprint. For
  each page:
- Start by filling in the frontmatter (title, pageTitle, description, tags) as
  given.
- Then draft the content following the provided **Content Outline**. The outline
  lists subsections and key points - use those as the H2/H3 headings and ensure
  all listed points are covered.
- Include the recommended diagrams and tables. The outline references Mermaid
  diagrams that exist in source docs (the AI can adapt those directly to our
  content). For example, the System Architecture page should include the layered
  architecture Mermaid
  diagram[\[34\]](https://github.com/settlemint/asset-tokenization-kit/blob/7481452d8fd7b498b9c493fd9f5cd6cc63379c71/kit/docs/content/docs/01-system-overview.md#L29-L38)[\[35\]](https://github.com/settlemint/asset-tokenization-kit/blob/7481452d8fd7b498b9c493fd9f5cd6cc63379c71/kit/docs/content/docs/01-system-overview.md#L57-L65)
  from the source (possibly simplified or updated as needed).
- Insert citations (as footnotes or reference links) when stating specific facts
  from the source (especially if this documentation will also be published
  externally - but since this is the single source of truth, we might not keep
  citations in the final text. However, during drafting, using them ensures
  accuracy).
- **Use Templates from The Good Docs Project:** Before writing each page,
  consider the recommended template:
- For **Concept** pages (Parts I and II mostly), ensure the doc begins with a
  short introduction of the concept, avoid imperative instructions, focus on
  explanation (the Good Docs concept template says to avoid how-to language in
  concept
  docs[\[145\]](https://www.thegooddocsproject.dev/template/concept#:~:text=Avoid%20instructional%20and%20referential%20information%3A,are%20different%20types%20of)).
- For **How-To** pages (Part III and some Part IV), follow a clear goal
  statement, prerequisites (if any), then numbered steps with results, and maybe
  a conclusion or next steps section.
- For **Tutorial** pages (like the Part III intro tutorial, or Dev environment
  setup), provide an intro that sets the scenario, then a series of steps, and a
  wrap-up (e.g., "Now you have X working!").
- For **Reference** pages (API ref, data model, etc.), present info
  systematically, often in tables or definition lists, and keep explanations
  brief and factual.
- Good Docs templates often also have sections like "Prerequisites" or "Further
  Reading" - include those if appropriate (for instance, a tutorial might have
  prerequisites like "You should have an admin account and at least one verified
  investor to follow this guide").
- **Quality Assurance and Iteration:** After drafting each page, the AI (or a
  reviewer) should:
- Check the factual accuracy against the sources (especially numbers, function
  names, etc.).
- Run a **Flesch Reading Ease** check to aim around 60-70 for tech content,
  maybe ~80 for business content as per guidelines (the AGENTS file suggests ~80
  for general
  content[\[146\]](https://github.com/settlemint/book-of-dalp/blob/ac9b43701dce421ccef78597d830f183247d65f4/AGENTS.md#L13-L20)).
  Simplify sentences if score is too low (meaning too hard to read).
- Ensure the style guidelines above are met: e.g., headings are present and
  descriptive, paragraphs short, tone appropriate, no forbidden words (we should
  programmatically search for the banned words list from AGENTS.md like "unlock,
  dive into, end-to-end", etc., and replace them with acceptable alternatives).
- Validate Mermaid diagrams (the syntax should be correct; maybe use a Mermaid
  live editor to verify they render as intended).
- Check internal linking: each page should be scanned for opportunities to link
  to others (e.g., the first mention of "Identity Registry" in one page could
  link to the Identity & Compliance page).
- Review tags and description for SEO keywords. Possibly use a tool or just
  common sense to see if a page's keywords match what a user would search (e.g.,
  the "Deployment Guide" description should probably include "Kubernetes" or
  "Helm" if that's what devops would search for).
- Make sure no images or diagrams are missing alt text or figure explanations
  for accessibility.
- **Documentation Continuity:** Ensure that the entire set of documents, if read
  sequentially, flows logically:
- Part I tells a story (problem to solution to product).
- Part II provides depth (ensure we reference Part I for context where needed,
  like "As discussed in the introduction, fragmentation is a major problem; here
  we'll see how our architecture solves it…").
- Part III and IV should refer back to concepts in Part II when needed (e.g. a
  user guide might say "The platform enforces transfer restrictions (see
  **Identity and Compliance System** in Architecture) automatically, so some
  transactions may be blocked if the recipient isn't verified." This technique
  educates while guiding).
- Part V's Roadmap should read like a conclusion - perhaps even referencing
  back: "We've seen how ATK addresses today's needs; looking ahead, we plan
  to...".
- If printed as a book, consider adding a bit of bridging text at the start or
  end of parts, but since it's a website primarily, it's okay if parts are
  somewhat independent. However, maybe a brief intro at the start of each part
  (landing page for the part) could be considered - e.g., a Part I landing that
  explains how to use that section. If so, add those pages too (like an
  index.mdx for each section with a brief blurb and list of pages). This wasn't
  explicitly asked, but it could enhance flow.
- **Extensive Review:** Given the critical importance ("our business depends on
  the quality"), possibly have domain experts review the drafts:
- e.g., developers of ATK review Part IV technical accuracy,
- compliance officer reviews the compliance pages,
- a product manager or sales engineer reviews Part I messaging.
- Incorporate their feedback to correct any mistakes or clarify where needed.
- **Final Polishing for "Best Documentation Site" Quality:**
- Add any missing diagrams or examples that could further enhance understanding.
  Don't shy away from including clarifying content even if not explicitly in
  source (like an illustrative example scenario).
- Check that each page's content indeed matches its description and that there
  is no duplication that bores the reader or contradiction that confuses them.
- Perhaps include an index or search page (though the site likely has search
  built-in).
- Ensure navigation is logical: Part ordering, numbering of pages as given in
  filenames (the docs use numeric prefixes like 01-, 02- which is good for
  ordering - we should maintain a similar scheme for new pages to keep them
  organized).
- Validate on the Fumadocs site locally to see that everything renders nicely
  (especially Mermaid charts).
- Optimize Mermaid diagrams layout or colors if needed for print (maybe use
  theme that prints well if it will go into PDF).
- Incorporate feedback from initial readers or testers.
