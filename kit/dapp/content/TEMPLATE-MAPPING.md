# Good Docs Project Template Mapping

This document shows which
[Good Docs Project](https://www.thegooddocsproject.dev/template) template is
used for each documentation page.

## Template Types Used

### Core Templates

- **[Concept](https://www.thegooddocsproject.dev/template/concept)** -
  Explanation of concepts, context, or background information
- **[How-to](https://www.thegooddocsproject.dev/template/how-to)** - Concise set
  of numbered steps to do one task
- **[Reference](https://www.thegooddocsproject.dev/template/reference)** -
  Specific, in-depth details about a particular topic
- **[Tutorial](https://www.thegooddocsproject.dev/template/tutorial)** -
  Instructions for setting up an example project for hands-on learning
- **[Troubleshooting](https://www.thegooddocsproject.dev/template/troubleshooting)** -
  Common problems, causes, and resolution steps
- **[Release notes](https://www.thegooddocsproject.dev/template/release-notes)** -
  New features, improvements, bug fixes, and known issues

### Miscellaneous Templates

- **[API reference](https://www.thegooddocsproject.dev/template/api-reference)** -
  API specifications and integration instructions
- **[Glossary](https://www.thegooddocsproject.dev/template/glossary)** - Terms
  and definitions unique to the organization
- **[Installation guide](https://www.thegooddocsproject.dev/template/installation-guide)** -
  Steps to install and set up the product

## Page-by-Page Mapping

### Executive Overview (All Concept)

| Page                    | Template | URL                                       |
| ----------------------- | -------- | ----------------------------------------- |
| Introduction            | Concept  | `/executive-overview/introduction`        |
| Market challenges       | Concept  | `/executive-overview/market-challenges`   |
| DALP solution           | Concept  | `/executive-overview/dalp-solution`       |
| ATK overview            | Concept  | `/executive-overview/atk-overview`        |
| Use cases               | Concept  | `/executive-overview/use-cases`           |
| Compliance and security | Concept  | `/executive-overview/compliance-security` |

### Architecture (Mixed Concept & Reference)

| Page                        | Template  | URL                                     |
| --------------------------- | --------- | --------------------------------------- |
| System architecture         | Concept   | `/architecture/system-architecture`     |
| Core components             | Concept   | `/architecture/core-components`         |
| SMART protocol              | Concept   | `/architecture/smart-protocol`          |
| Asset contracts             | Reference | `/architecture/asset-contracts`         |
| Identity and compliance     | Concept   | `/architecture/identity-compliance`     |
| Addon modules               | Reference | `/architecture/addon-modules`           |
| Factory and upgradeability  | Concept   | `/architecture/factory-upgradeability`  |
| Frontend architecture       | Concept   | `/architecture/frontend-architecture`   |
| Asset management UX         | Concept   | `/architecture/asset-management-ux`     |
| Backend API                 | Concept   | `/architecture/backend-api`             |
| Database model              | Reference | `/architecture/database-model`          |
| Blockchain indexing         | Concept   | `/architecture/blockchain-indexing`     |
| External integrations       | Concept   | `/architecture/external-integrations`   |
| Deployment and operations   | Concept   | `/architecture/deployment-operations`   |
| Performance and scalability | Concept   | `/architecture/performance-scalability` |
| Regulatory compliance       | Concept   | `/architecture/regulatory-compliance`   |

### User Guides (Tutorial + How-to + Troubleshooting)

| Page               | Template        | URL                              |
| ------------------ | --------------- | -------------------------------- |
| Getting started    | Tutorial        | `/user-guides/getting-started`   |
| Issue a bond       | How-to          | `/user-guides/issue-bond`        |
| Issue equity       | How-to          | `/user-guides/issue-equity`      |
| Issue a fund       | How-to          | `/user-guides/issue-fund`        |
| Issue a stablecoin | How-to          | `/user-guides/issue-stablecoin`  |
| Issue a deposit    | How-to          | `/user-guides/issue-deposit`     |
| Manage investors   | How-to          | `/user-guides/manage-investors`  |
| Admin settings     | How-to          | `/user-guides/admin-settings`    |
| Fiat bridge        | How-to          | `/user-guides/fiat-bridge`       |
| Corporate actions  | How-to          | `/user-guides/corporate-actions` |
| Troubleshooting    | Troubleshooting | `/user-guides/troubleshooting`   |

### Developer Guides (Tutorial + How-to + Reference)

| Page                 | Template           | URL                                      |
| -------------------- | ------------------ | ---------------------------------------- |
| Dev environment      | Tutorial           | `/developer-guides/dev-environment`      |
| Code structure       | Reference          | `/developer-guides/code-structure`       |
| Extending contracts  | How-to             | `/developer-guides/extending-contracts`  |
| Using the API        | Tutorial           | `/developer-guides/using-api`            |
| API reference        | API reference      | `/developer-guides/api-reference`        |
| Contract reference   | Reference          | `/developer-guides/contract-reference`   |
| Data model reference | Reference          | `/developer-guides/data-model-reference` |
| Deployment guide     | Installation guide | `/developer-guides/deployment-guide`     |
| Testing and QA       | How-to             | `/developer-guides/testing-qa`           |
| Developer FAQ        | Troubleshooting    | `/developer-guides/dev-faq`              |

### Appendices (Special Templates)

| Page          | Template        | URL                         |
| ------------- | --------------- | --------------------------- |
| Glossary      | Glossary        | `/appendices/glossary`      |
| FAQ           | Troubleshooting | `/appendices/faq`           |
| Release notes | Release notes   | `/appendices/release-notes` |
| Roadmap       | Concept         | `/appendices/roadmap`       |

## Template Distribution

| Template Type      | Count  | Percentage |
| ------------------ | ------ | ---------- |
| Concept            | 20     | 42.55%     |
| How-to             | 11     | 23.40%     |
| Reference          | 6      | 12.77%     |
| Tutorial           | 3      | 6.38%      |
| Troubleshooting    | 3      | 6.38%      |
| API reference      | 1      | 2.13%      |
| Installation guide | 1      | 2.13%      |
| Release notes      | 1      | 2.13%      |
| Glossary           | 1      | 2.13%      |
| **Total**          | **47** | **100%**   |

## Usage in MDX Files

Each page includes a callout box after the title indicating which template to
follow:

```mdx
# Page title

<Callout type="info" title="Template guide">
  This page follows The Good Docs Project **[Template Name](URL)** template.
</Callout>
```

This helps content writers quickly identify the appropriate structure and best
practices for each page type.
