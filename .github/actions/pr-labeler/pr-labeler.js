/**
 * PR Labeler Script
 *
 * Labels pull requests based on conventional commit format and manages
 * various label types including type labels, status labels, and special labels.
 */

// Minimal logging control (default: errors only)
(function configureLogging() {
  try {
    const level = (process.env.LOG_LEVEL || "error").toLowerCase();
    const levels = { error: 0, warn: 1, info: 2, debug: 3 };
    const current = levels[level] ?? 0;
    const noop = () => {};
    if (current < 3) console.debug = noop;
    if (current < 2) console.info = noop;
    if (current < 2) console.log = noop;
    if (current < 1) console.warn = noop;
  } catch (_) {}
})();

/**
 * Label definitions with colors and descriptions
 */
const LABEL_DEFINITIONS = {
  // Conventional commit types
  feat: { color: "0E8A16", description: "New feature" }, // Green
  fix: { color: "B60205", description: "Bug fix" }, // Dark red
  docs: { color: "0075CA", description: "Documentation changes" }, // Blue
  style: {
    color: "C5DEF5",
    description: "Code style changes (formatting, etc)",
  }, // Light blue
  refactor: { color: "FBF2C4", description: "Code refactoring" }, // Light yellow
  perf: { color: "FF6B6B", description: "Performance improvements" }, // Coral red
  test: { color: "795AA0", description: "Test additions or modifications" }, // Purple
  build: { color: "727272", description: "Build system changes" }, // Gray
  ci: { color: "4A5568", description: "CI/CD configuration changes" }, // Dark gray
  revert: { color: "CF222E", description: "Revert previous commits" }, // Bright red
  chore: { color: "F9C0C7", description: "Maintenance tasks" }, // Pink

  // Special labels
  dependencies: { color: "FF9500", description: "Dependency updates" }, // Orange
  breaking: { color: "D93F0B", description: "Breaking changes" }, // Red-orange

  // Status labels (managed by other workflows)
  "status:draft": {
    color: "848484",
    description: "Pull request is in draft status",
  }, // Medium gray
  "status:ready-for-review": {
    color: "FBCA04",
    description: "Pull request is ready for review",
  }, // Yellow
  "status:approved": {
    color: "28A745",
    description: "Pull request has been approved",
  }, // Bright green
  "status:mergeable": {
    color: "0E8A16",
    description: "Pull request is approved, tests pass, and ready to merge",
  }, // Dark green
  "status:merged": {
    color: "6F42C1",
    description: "Pull request has been merged",
  }, // Purple

  // QA labels (managed by other workflows)
  "qa:pending": { color: "CEE0F5", description: "QA workflow needs to run" }, // Light purple
  "qa:running": {
    color: "FFA500",
    description: "QA workflow is currently running",
  }, // Orange
  "qa:success": {
    color: "22863A",
    description: "QA workflow passed successfully",
  }, // Forest green
  "qa:failed": { color: "CB2431", description: "QA workflow failed" }, // Red
};

/**
 * Ensure all labels exist in the repository
 *
 * @param {Object} params - Parameters
 * @param {Object} params.github - GitHub API client
 * @param {Object} params.context - GitHub Actions context
 */
async function ensureLabelsExist({ github, context }) {
  console.log("Ensuring all labels exist in repository...");

  // Get existing labels
  const existingLabels = await github.paginate(
    github.rest.issues.listLabelsForRepo,
    {
      owner: context.repo.owner,
      repo: context.repo.repo,
    }
  );

  const existingLabelNames = new Set(existingLabels.map((l) => l.name));

  // Create or update labels
  for (const [name, config] of Object.entries(LABEL_DEFINITIONS)) {
    const existingLabel = existingLabels.find((l) => l.name === name);

    if (!existingLabel) {
      // Create new label
      try {
        await github.rest.issues.createLabel({
          owner: context.repo.owner,
          repo: context.repo.repo,
          name: name,
          color: config.color,
          description: config.description,
        });
        console.log(`Created label: ${name}`);
      } catch (error) {
        console.log(`Failed to create label ${name}: ${error.message}`);
      }
    } else if (
      existingLabel.color !== config.color ||
      existingLabel.description !== config.description
    ) {
      // Update existing label if color or description changed
      try {
        await github.rest.issues.updateLabel({
          owner: context.repo.owner,
          repo: context.repo.repo,
          name: name,
          color: config.color,
          description: config.description,
        });
        console.log(
          `Updated label: ${name} (color: ${existingLabel.color} -> ${config.color}, desc: "${existingLabel.description}" -> "${config.description}")`
        );
      } catch (error) {
        console.log(`Failed to update label ${name}: ${error.message}`);
      }
    }
  }
}

/**
 * Analyze PR and apply appropriate labels
 *
 * @param {Object} params - Parameters
 * @param {Object} params.github - GitHub API client
 * @param {Object} params.context - GitHub Actions context
 * @param {number} params.prNumber - Pull request number
 * @param {string} params.prTitle - Pull request title
 * @param {string} params.prBody - Pull request body
 */
async function analyzePRAndApplyLabels({
  github,
  context,
  prNumber,
  prTitle,
  prBody = "",
}) {
  console.log(`Analyzing PR #${prNumber}: "${prTitle}"`);

  const labelsToAdd = [];

  // Check for dependencies first (takes precedence)
  if (prTitle.match(/^(chore|fix|build)\(deps\):/)) {
    labelsToAdd.push("dependencies");
    console.log("Detected dependency update");
  } else {
    // Check conventional commit type from title
    const typeMatch = prTitle.match(
      /^(feat|fix|docs|style|refactor|perf|test|build|ci|revert)(\(.+\))?:/
    );
    if (typeMatch) {
      labelsToAdd.push(typeMatch[1]);
      console.log(`Detected conventional commit type: ${typeMatch[1]}`);
    } else {
      // If no conventional commit format, add chore
      labelsToAdd.push("chore");
      console.log(
        "No conventional commit format detected, defaulting to chore"
      );
    }
  }

  // Check for breaking changes
  if (
    prTitle.match(
      /^(feat|fix|docs|style|refactor|perf|test|build|ci|revert)(\(.+\))?!:/
    ) ||
    prBody.includes("BREAKING CHANGE:")
  ) {
    labelsToAdd.push("breaking");
    console.log("Detected breaking change");
  }

  // Check PR draft status
  const { data: pr } = await github.rest.pulls.get({
    owner: context.repo.owner,
    repo: context.repo.repo,
    pull_number: prNumber,
  });

  if (pr.draft) {
    labelsToAdd.push("status:draft");
    console.log("PR is in draft status");
  } else {
    labelsToAdd.push("status:ready-for-review");
    console.log("PR is ready for review");
  }

  // Add labels to PR
  if (labelsToAdd.length > 0) {
    console.log(`Adding labels to PR #${prNumber}: ${labelsToAdd.join(", ")}`);

    await github.rest.issues.addLabels({
      owner: context.repo.owner,
      repo: context.repo.repo,
      issue_number: prNumber,
      labels: labelsToAdd,
    });

    console.log(`✅ Successfully added ${labelsToAdd.length} labels`);
  } else {
    console.log("No labels to add");
  }
}

/**
 * Get label definitions (useful for other scripts)
 */
function getLabelDefinitions() {
  return LABEL_DEFINITIONS;
}

module.exports = {
  ensureLabelsExist,
  analyzePRAndApplyLabels,
  getLabelDefinitions,
  LABEL_DEFINITIONS,
};
