/**
 * Build Status Labeler Script
 *
 * Manages QA status labels on pull requests with efficient delta-based updates.
 * Only changes what's necessary to minimize GitHub UI noise.
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
 * Label definitions for QA statuses
 */
const QA_LABELS = [
  {
    name: "qa:pending",
    color: "CEE0F5",
    description: "QA workflow needs to run",
  }, // Light purple
  {
    name: "qa:running",
    color: "FFA500",
    description: "QA workflow is currently running",
  }, // Orange
  {
    name: "qa:success",
    color: "22863A",
    description: "QA workflow passed successfully",
  }, // Forest green
  { name: "qa:failed", color: "CB2431", description: "QA workflow failed" }, // Red
];

const QA_LABEL_NAMES = QA_LABELS.map((l) => l.name);

/**
 * Create or update QA labels in the repository
 */
async function ensureLabelsExist({ github, context }) {
  console.log("Ensuring QA labels exist in repository...");

  // Get all existing labels
  const existingLabels = await github.paginate(
    github.rest.issues.listLabelsForRepo,
    {
      owner: context.repo.owner,
      repo: context.repo.repo,
    }
  );

  const existingLabelNames = new Set(existingLabels.map((l) => l.name));

  // Create or update labels
  for (const label of QA_LABELS) {
    const existingLabel = existingLabels.find((l) => l.name === label.name);

    if (!existingLabel) {
      // Create new label
      try {
        await github.rest.issues.createLabel({
          owner: context.repo.owner,
          repo: context.repo.repo,
          name: label.name,
          color: label.color,
          description: label.description,
        });
        console.log(`Created label: ${label.name}`);
      } catch (error) {
        console.log(`Failed to create label ${label.name}: ${error.message}`);
      }
    } else if (
      existingLabel.color !== label.color ||
      existingLabel.description !== label.description
    ) {
      // Update existing label if color or description changed
      try {
        await github.rest.issues.updateLabel({
          owner: context.repo.owner,
          repo: context.repo.repo,
          name: label.name,
          color: label.color,
          description: label.description,
        });
        console.log(
          `Updated label: ${label.name} (color: ${existingLabel.color} -> ${label.color}, desc: "${existingLabel.description}" -> "${label.description}")`
        );
      } catch (error) {
        console.log(`Failed to update label ${label.name}: ${error.message}`);
      }
    }
  }
}

/**
 * Update build status label efficiently (only changes what's necessary)
 */
async function updateBuildStatusLabel({
  github,
  context,
  prNumber,
  workflowStatus,
}) {
  // Determine the desired label based on status
  let desiredLabel = "";
  switch (workflowStatus) {
    case "pending":
      desiredLabel = "qa:pending";
      break;
    case "running":
      desiredLabel = "qa:running";
      break;
    case "success":
      desiredLabel = "qa:success";
      break;
    case "failure":
    case "cancelled":
      desiredLabel = "qa:failed";
      break;
  }

  if (!desiredLabel) {
    console.log("No label to apply for status:", workflowStatus);
    return;
  }

  console.log(
    `Updating PR #${prNumber} with status: ${workflowStatus} -> label: ${desiredLabel}`
  );

  // Get current labels on the PR
  const { data: currentLabels } = await github.rest.issues.listLabelsOnIssue({
    owner: context.repo.owner,
    repo: context.repo.repo,
    issue_number: prNumber,
  });

  const currentLabelNames = currentLabels.map((l) => l.name);
  console.log("Current PR labels:", currentLabelNames);

  // Find which QA labels are currently on the PR
  const currentQaLabels = currentLabelNames.filter((l) =>
    QA_LABEL_NAMES.includes(l)
  );
  console.log("Current QA labels:", currentQaLabels);
  console.log("Desired QA label:", desiredLabel);

  // Check if we already have the desired label
  if (currentQaLabels.length === 1 && currentQaLabels[0] === desiredLabel) {
    console.log("PR already has the correct label, no changes needed");
    return;
  }

  // Calculate what needs to change
  const labelsToRemove = currentQaLabels.filter((l) => l !== desiredLabel);
  const needsToAdd = !currentQaLabels.includes(desiredLabel);

  console.log("Labels to remove:", labelsToRemove);
  console.log("Need to add label:", needsToAdd ? desiredLabel : "none");

  // Remove outdated QA labels
  for (const label of labelsToRemove) {
    try {
      console.log(`Removing label: ${label}`);
      await github.rest.issues.removeLabel({
        owner: context.repo.owner,
        repo: context.repo.repo,
        issue_number: prNumber,
        name: label,
      });
    } catch (error) {
      console.log(`Failed to remove label ${label}: ${error.message}`);
    }
  }

  // Add the new label if needed
  if (needsToAdd) {
    try {
      console.log(`Adding label: ${desiredLabel}`);
      await github.rest.issues.addLabels({
        owner: context.repo.owner,
        repo: context.repo.repo,
        issue_number: prNumber,
        labels: [desiredLabel],
      });
    } catch (error) {
      console.log(`Failed to add label ${desiredLabel}: ${error.message}`);
    }
  }

  console.log("Label update completed");
}

module.exports = {
  ensureLabelsExist,
  updateBuildStatusLabel,
};
