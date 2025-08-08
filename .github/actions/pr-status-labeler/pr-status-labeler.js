/**
 * PR Status Labeler Script
 *
 * Manages PR status labels efficiently by only changing what's necessary.
 * Handles various PR states including draft, approved, mergeable, merged, and abandoned.
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
 * Status label definitions
 */
const STATUS_LABELS = [
  {
    name: "status:draft",
    color: "848484",
    description: "Pull request is in draft status",
  }, // Medium gray
  {
    name: "status:ready-for-review",
    color: "FBCA04",
    description: "Pull request is ready for review",
  }, // Yellow
  {
    name: "status:approved",
    color: "28A745",
    description: "Pull request has been approved",
  }, // Bright green
  {
    name: "status:mergeable",
    color: "0E8A16",
    description: "Pull request is approved, tests pass, and ready to merge",
  }, // Dark green
  {
    name: "status:merged",
    color: "6F42C1",
    description: "Pull request has been merged",
  }, // Purple
  {
    name: "status:abandoned",
    color: "C0C0C0",
    description: "Pull request was closed without merging",
  }, // Light gray
];

const STATUS_LABEL_NAMES = STATUS_LABELS.map((l) => l.name);

/**
 * Ensure status labels exist in the repository
 *
 * @param {Object} params - Parameters
 * @param {Object} params.github - GitHub API client
 * @param {Object} params.context - GitHub Actions context
 */
async function ensureStatusLabelsExist({ github, context }) {
  console.log("Ensuring status labels exist in repository...");

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
  for (const label of STATUS_LABELS) {
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
 * Update PR status label efficiently (only changes what's necessary)
 *
 * @param {Object} params - Parameters
 * @param {Object} params.github - GitHub API client
 * @param {Object} params.context - GitHub Actions context
 * @param {number} params.prNumber - Pull request number
 * @param {boolean} params.isDraft - Whether the PR is a draft
 * @param {boolean} params.hasApproval - Whether the PR has been approved
 * @param {string} params.qaStatus - The QA status (pending, running, success, failed)
 * @param {boolean} params.isMerged - Whether the PR has been merged
 * @param {boolean} params.isAbandoned - Whether the PR has been abandoned
 */
async function updatePRStatusLabel({
  github,
  context,
  prNumber,
  isDraft,
  hasApproval,
  qaStatus,
  isMerged,
  isAbandoned,
}) {
  console.log(`Updating status label for PR #${prNumber}`);
  console.log("Current state:", {
    isDraft,
    hasApproval,
    qaStatus,
    isMerged,
    isAbandoned,
  });

  // Determine the appropriate label based on PR state
  let desiredLabel = "";

  if (isMerged) {
    desiredLabel = "status:merged";
  } else if (isAbandoned) {
    desiredLabel = "status:abandoned";
  } else if (isDraft) {
    desiredLabel = "status:draft";
  } else if (hasApproval && qaStatus === "success") {
    desiredLabel = "status:mergeable";
  } else if (hasApproval) {
    desiredLabel = "status:approved";
  } else {
    desiredLabel = "status:ready-for-review";
  }

  console.log(`Desired status label: ${desiredLabel}`);

  // Get current labels on the PR
  const { data: currentLabels } = await github.rest.issues.listLabelsOnIssue({
    owner: context.repo.owner,
    repo: context.repo.repo,
    issue_number: prNumber,
  });

  const currentLabelNames = currentLabels.map((l) => l.name);
  console.log("Current PR labels:", currentLabelNames);

  // Find which status labels are currently on the PR
  const currentStatusLabels = currentLabelNames.filter((l) =>
    STATUS_LABEL_NAMES.includes(l)
  );
  console.log("Current status labels:", currentStatusLabels);

  // Check if we already have the desired label
  if (
    currentStatusLabels.length === 1 &&
    currentStatusLabels[0] === desiredLabel
  ) {
    console.log("PR already has the correct status label, no changes needed");
    return;
  }

  // Calculate what needs to change
  const labelsToRemove = currentStatusLabels.filter((l) => l !== desiredLabel);
  const needsToAdd = !currentStatusLabels.includes(desiredLabel);

  console.log("Labels to remove:", labelsToRemove);
  console.log("Need to add label:", needsToAdd ? desiredLabel : "none");

  // Remove outdated status labels
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
  if (needsToAdd && desiredLabel) {
    try {
      console.log(`Adding label: ${desiredLabel}`);
      await github.rest.issues.addLabels({
        owner: context.repo.owner,
        repo: context.repo.repo,
        issue_number: prNumber,
        labels: [desiredLabel],
      });
      console.log(`✅ Successfully added status label: ${desiredLabel}`);
    } catch (error) {
      console.log(`Failed to add label ${desiredLabel}: ${error.message}`);
    }
  }
}

module.exports = {
  ensureStatusLabelsExist,
  updatePRStatusLabel,
  STATUS_LABELS,
  STATUS_LABEL_NAMES,
};
