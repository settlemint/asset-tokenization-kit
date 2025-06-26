# Claude Code Initial Setup Prompt

Please follow the steps below to set up an interactive document update system
for this project.

1. Explore Existing Documentation Start by exploring the existing documentation
   in the project:

- All .md files in the .cursor/rules/ directory
- The docs/ directory (if it exists)
- Any _.md files in the root and `kit/_` directories (e.g., README.md,
  CONTRIBUTING.md)
- Any other project-specific documentation directories
- List the documents you find and provide a brief description of their purpose.

2. Add to CLAUDE.md

Add the following content to the CLAUDE.md file. If the file already exists,
keep the existing content and append the following section.

📚 Document Auto-Update System

This project uses a system that systematically manages knowledge gained during
development and reflects it in existing documentation.

### Documents to Review

Before starting work, be sure to review the following documents:

[Generate the list based on the results of the document exploration] Example:

- `.cursor/rules/coding-standards.md` - Coding Standards
- `.cursor/rules/architecture.md` - Architecture Design
- `docs/troubleshooting.md` - Troubleshooting Guide

### Update Rules

#### When to Propose Updates

Please propose document updates in the following situations:

1. **When resolving errors or problems**
2. **When discovering efficient implementation patterns**
3. **When establishing usage patterns for new APIs/libraries**
4. **When existing documentation is outdated or incorrect**
5. **When identifying frequently referenced information**
6. **When completing fixes from code reviews**

#### Proposal Format

💡 Document Update Proposal: [Describe the situation] 【Update Details】[Specify
additions/changes] 【Update Candidates】 [File Path 1] - [Reason] [File Path
2] - [Reason] New File Creation - [Reason] Where should this be added? (Select a
number or skip)

#### Approval Process

1. User selects the target file for the update
2. Preview of the actual update is shown
3. User provides final approval (`yes` / `edit` / `no`)
4. Upon approval, the file is updated

### Coordination with Existing Documents

- Follow existing formatting and style conventions
- If related content exists, clearly reference it
- Include the date in YYYY-MM-DD format in the update history

### Important Constraints

1. **Do not update files without user approval**
2. **Do not delete or modify existing content—additions only**
3. **Do not record sensitive information (API keys, passwords, etc.)**
4. **Follow project-specific conventions and style guides**

### Document Splitting Strategy

To prevent `CLAUDE.md` from becoming too large, split files using the following
guidelines:

- **If it exceeds 100 lines**: Suggest splitting related content into separate
  files
- **Recommended Splits**:
  - `.cursor/rules/update-system.md` - Rules for the update system
  - `.cursor/rules/project-specific.md` - Project-specific configurations
  - `.cursor/rules/references.md` - List of documents to reference
- **Leave only a summary and links in `CLAUDE.md`**; place details in individual
  files

---

#### 3. Propose Recommended Document Structure

Based on analysis of the current document structure, suggest potentially missing
documents:

📁 **Proposed Document Structure** We recommend adding the following documents
to this project:

[Suggest missing documentation based on the exploration results] Example:

1. `.cursor/rules/patterns.md` - Implementation Patterns & Best Practices →
   Collect efficient code patterns

2. `.cursor/rules/troubleshooting.md` - Troubleshooting Guide → Systematize
   errors and solutions

3. `.cursor/rules/dependencies.md` - Dependencies & API Usage → Document usage
   of external libraries

4. `.cursor/rules/remote-integration.md` - Remote Repository Integration →
   Record best practices for Git workflows, branching strategy, PR/MR templates,
   CI/CD settings, etc.

Do you want to create these files? (Select numbers: "1,2" or "all" or "skip")
For the selected files, please create an initial template.

---

#### 4. Operation Confirmation

After completing setup, display the following message:

✅ Document auto-update system setup is complete!

**【Setup Details】**

- Added operational rules to `CLAUDE.md`
- [List of created documents]

**【Future Operation】**

1. When new insights arise during work, update proposals will be made
2. Updates will be made only after your approval
3. Existing documentation formats will be followed, and knowledge will be
   accumulated systematically

Would you like to run a test? (Trigger a test error to verify the proposal flow)

---

#### 5. Log the Initial Setup

Finally, create a `setup-log.md` file under `.cursor/rules/` (or another
appropriate location) to log the initial setup:

# Document Auto-Update System Setup Log

## Setup Date

[YYYY-MM-DD HH:MM]

## Actions Taken

1. Explored existing documentation

- [List of discovered files]

2. Added to `CLAUDE.md`

- Document reference list
- Update rules
- Approval process

3. Newly created documents

- [List of created files]

## Notes

[Include any special notes if necessary]

Please follow the steps above and confirm with the user at each stage.
