# Level 1 Generic Documentation Structure Explained
## Clear Logic for Index vs. Content Files

---

## 🧠 The Logic (IQ 145 Compatible)

Think of it like a **book structure**:
- **Table of Contents** = index.md (navigation)
- **Chapters** = individual .md files (content)

---

## 📚 Three Distinct Patterns

### Type A: Hub & Spoke (Navigation + Content Files)
**When to use**: Multiple related topics that need organization

```
01-overview/
├── index.md                  ← Table of contents (30 lines max)
├── market-opportunity.md     ← Full content (150+ lines)
├── platform-capabilities.md  ← Full content (180+ lines)
├── business-value-roi.md     ← Full content (220+ lines)
└── settlemint-authority.md   ← Full content (180+ lines)
```

**index.md contains**:
- Brief intro (2-3 sentences)
- Links to each file with 1-line description
- Quick facts/summary bullets
- NO detailed content

---

### Type B: Direct Access (No Index Needed)
**When to use**: Self-contained topics that don't need introduction

```
05-asset-classes/
├── bonds.md                  ← Standalone (users go direct)
├── equity.md                 ← Standalone
├── funds.md                  ← Standalone
├── stablecoins.md           ← Standalone
└── deposits.md               ← Standalone
❌ NO index.md!
```

**Why no index?** Each asset class is independent - users search for "bonds" and go straight to bonds.md

---

### Type C: Single Document (Everything in Index)
**When to use**: Content that's always consumed as a whole

```
08-glossary/
└── index.md                  ← ALL terms A-Z in one file

09-faq/
└── index.md                  ← ALL Q&As in one file
```

**Why only index?** Users expect to browse/search all FAQs or glossary terms in one place

---

## 🎯 Decision Tree

```
Does this section have multiple independent topics?
├── YES → Does each topic deserve its own page?
│   ├── YES → Use Type A (Hub & Spoke)
│   └── NO → Use Type C (Single Document)
└── NO → Are the items self-contained/searchable?
    ├── YES → Use Type B (Direct Access)
    └── NO → Use Type C (Single Document)
```

---

## ✅ Current Structure Status

| Folder | Pattern | Index Status | Action |
|--------|---------|-------------|---------|
| 00-executive-materials | Type B | None needed | ✅ Correct |
| 01-overview | Type A | Just fixed | ✅ Now correct |
| 02-architecture | Type A | Needs fixing | ⚠️ Make navigation |
| 03-positioning | Type A | Needs fixing | ⚠️ Make navigation |
| 04-compliance-identity | Type A | Needs fixing | ⚠️ Make navigation |
| 05-asset-classes | Type B | Should remove | ❌ Delete index.md |
| 06-integration-ecosystem | Type B | Should remove | ❌ Delete index.md |
| 07-pricing-licensing | Type B | Should remove | ❌ Delete index.md |
| 08-glossary | Type C | Keep as-is | ✅ Correct |
| 09-faq | Type C | Keep as-is | ✅ Correct |

---

## 📝 Index.md Template for Type A Folders

```markdown
---
title: [Section Name]
description: [One-line description]
---

# [Section Name]

**[One bold sentence capturing the essence of this section]**

## In This Section

### 📊 [Topic 1 Title](./topic-1-file)
[One-line description of what's in this file]

### 🏗️ [Topic 2 Title](./topic-2-file)
[One-line description of what's in this file]

### 💰 [Topic 3 Title](./topic-3-file)
[One-line description of what's in this file]

## Quick Facts
- **Key Metric 1**: Value
- **Key Metric 2**: Value
- **Key Metric 3**: Value

## Get Started
[One sentence guiding where to start]
```

---

## 🚀 Why This Structure?

1. **SEO**: Each topic gets its own URL and metadata
2. **Navigation**: Users can jump directly to what they need
3. **Maintainability**: Update one topic without touching others
4. **FumaDocs**: This structure works perfectly with FumaDocs sidebar generation
5. **Sales Ready**: Sales team can link directly to specific topics

---

## Summary

The `01-overview/index.md` is now fixed as a **navigation page** (37 lines) instead of content dump (57 lines). Each topic has its own file with full content (150-220 lines each). This follows the WINNER-PLAN exactly.

