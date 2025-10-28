# Documentation structure

This directory contains the scaffolded documentation structure for the Asset
Tokenization Kit, organized according to the plan outlined in `PLAN.md`.

## Structure overview

```
docs/
├── index.mdx                 # Main documentation landing page
├── meta.json                 # Root navigation configuration
├── TEMPLATE-MAPPING.md       # Good Docs Project template assignments
│
├── executive-overview/       # Executive overview (6 pages)
│   ├── meta.json
│   ├── introduction.mdx
│   ├── market-challenges.mdx
│   ├── dalp-solution.mdx
│   ├── atk-overview.mdx
│   ├── use-cases.mdx
│   └── compliance-security.mdx
│
├── architecture/             # Solution architecture and capabilities (16 pages)
│   ├── meta.json
│   ├── system-architecture.mdx
│   ├── core-components.mdx
│   ├── smart-protocol.mdx
│   ├── asset-contracts.mdx
│   ├── identity-compliance.mdx
│   ├── addon-modules.mdx
│   ├── factory-upgradeability.mdx
│   ├── frontend-architecture.mdx
│   ├── asset-management-ux.mdx
│   ├── backend-api.mdx
│   ├── database-model.mdx
│   ├── blockchain-indexing.mdx
│   ├── external-integrations.mdx
│   ├── deployment-operations.mdx
│   ├── performance-scalability.mdx
│   └── regulatory-compliance.mdx
│
├── user-guides/              # User guides (11 pages)
│   ├── meta.json
│   ├── getting-started.mdx
│   ├── issue-bond.mdx
│   ├── issue-equity.mdx
│   ├── issue-fund.mdx
│   ├── issue-stablecoin.mdx
│   ├── issue-deposit.mdx
│   ├── manage-investors.mdx
│   ├── admin-settings.mdx
│   ├── fiat-bridge.mdx
│   ├── corporate-actions.mdx
│   └── troubleshooting.mdx
│
├── developer-guides/         # Developer guides and reference (10 pages)
│   ├── meta.json
│   ├── dev-environment.mdx
│   ├── code-structure.mdx
│   ├── extending-contracts.mdx
│   ├── using-api.mdx
│   ├── api-reference.mdx
│   ├── contract-reference.mdx
│   ├── data-model-reference.mdx
│   ├── deployment-guide.mdx
│   ├── testing-qa.mdx
│   └── dev-faq.mdx
│
└── appendices/               # Appendices and resources (4 pages)
    ├── meta.json
    ├── glossary.mdx
    ├── faq.mdx
    ├── release-notes.mdx
    └── roadmap.mdx
```

## Statistics

- **Total pages**: 48 documentation pages (+ index)
- **Total files**: 55 files (including meta.json and TEMPLATE-MAPPING.md)
- **Sections**: 5 major sections
- **Templates used**: 9 different Good Docs Project templates

## File conventions

### Frontmatter

Each MDX file includes YAML frontmatter with:

- `title`: Sentence case title
- `description`: One-line summary for SEO
- `navTitle`: Short navigation title (sentence case)
- `tags`: Array of relevant keywords

### meta.json files

Each directory includes a `meta.json` file that defines:

- `title`: Section title (sentence case)
- `pages`: Array of page slugs in order

### Template references

Each page includes a callout indicating which Good Docs Project template to
follow:

```mdx
<Callout type="info" title="Template guide">
  This page follows The Good Docs Project **[Template Name](URL)** template.
</Callout>
```

See [TEMPLATE-MAPPING.md](./TEMPLATE-MAPPING.md) for the complete template
assignment per page.

### URL structure

- Semantic URLs (e.g., `/executive-overview/` not `/part-i/`)
- Lowercase with hyphens (e.g., `market-challenges` not `Market_Challenges`)
- No file extensions in URLs (handled by Fumadocs)

## Content status

All files are currently **scaffolded placeholders** with:

- Proper frontmatter metadata following sentence case
- Good Docs Project template callouts
- Planned subsection outlines
- "Content to be added" markers

## Good Docs Project templates used

| Template           | Pages | Use Case                                |
| ------------------ | ----- | --------------------------------------- |
| Concept            | 24    | Explanations and background information |
| How-to             | 11    | Step-by-step task instructions          |
| Reference          | 6     | Detailed technical specifications       |
| Tutorial           | 3     | Hands-on learning guides                |
| Troubleshooting    | 3     | Problem diagnosis and solutions         |
| API reference      | 1     | API endpoint documentation              |
| Installation guide | 1     | Setup and deployment instructions       |
| Release notes      | 1     | Version history and changes             |
| Glossary           | 1     | Term definitions                        |

## Next steps

1. Review structure against PLAN.md
2. Begin content writing following:
   - AGENTS.md style guidelines
   - Good Docs Project template for each page
3. Add diagrams (Mermaid) where specified in PLAN.md
4. Cross-reference between related pages
5. Add code examples in developer guides section

## Style guidelines

Content should follow the guidelines in `../AGENTS.md`:

- **Executive overview**: Conversational yet professional tone
- **Architecture**: Formal and precise technical tone
- **User guides**: Instructional and reassuring tone
- **Developer guides**: Technical and concise tone
- **Appendices**: Mixed tone appropriate to content type

## References

- `PLAN.md` - Detailed content plan and structure
- `AGENTS.md` - Writing style guide and conventions
- `TEMPLATE-MAPPING.md` - Good Docs Project template assignments
- https://fumadocs.dev/docs/ui/page-conventions - Fumadocs conventions
- https://www.thegooddocsproject.dev/template - Good Docs Project templates
