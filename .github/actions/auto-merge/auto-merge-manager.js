/**
 * Auto-Merge Manager Script
 *
 * Manages auto-merge functionality for pull requests based on approval status,
 * QA status, and draft state. Automatically enables or disables auto-merge
 * to streamline the PR merge process.
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
 * Manage auto-merge for a pull request
 *
 * @param {Object} params - Parameters for managing auto-merge
 * @param {Object} params.github - GitHub API client
 * @param {Object} params.context - GitHub Actions context
 * @param {number} params.prNumber - Pull request number
 * @param {string} params.prAuthor - Pull request author username
 * @param {string} params.prAuthorType - Type of author (User or Bot)
 * @param {boolean} params.hasApproval - Whether PR has approval
 * @param {string} params.qaStatus - QA status (success, failed, running, pending)
 * @param {boolean} params.isDraft - Whether PR is a draft
 * @param {string} params.mergeMethod - Merge method (merge, squash, rebase)
 */
async function manageAutoMerge({
  github,
  context,
  prNumber,
  prAuthor,
  prAuthorType,
  hasApproval,
  qaStatus,
  isDraft,
  mergeMethod = "squash",
}) {
  console.log(`Managing auto-merge for PR #${prNumber}`);
  console.log("Current state:", {
    prAuthor,
    prAuthorType,
    hasApproval,
    qaStatus,
    isDraft,
    mergeMethod,
  });

  // Skip auto-merge for bot PRs
  if (prAuthorType === "Bot") {
    console.log(`Skipping auto-merge for bot PR from ${prAuthor}`);
    return;
  }

  // Determine if PR is mergeable
  const isMergeable = hasApproval && qaStatus === "success" && !isDraft;
  console.log(
    `PR #${prNumber} is ${isMergeable ? "mergeable" : "not mergeable"}`
  );

  try {
    if (isMergeable) {
      // Enable auto-merge
      console.log(
        `Enabling auto-merge for PR #${prNumber} with method: ${mergeMethod}`
      );

      // First, get the PR node ID required for GraphQL
      const { data: pr } = await github.rest.pulls.get({
        owner: context.repo.owner,
        repo: context.repo.repo,
        pull_number: prNumber,
      });

      // Use GraphQL to enable auto-merge
      const mutation = `
        mutation($pullRequestId: ID!, $mergeMethod: PullRequestMergeMethod!) {
          enablePullRequestAutoMerge(input: {
            pullRequestId: $pullRequestId,
            mergeMethod: $mergeMethod
          }) {
            pullRequest {
              autoMergeRequest {
                enabledAt
                mergeMethod
              }
            }
          }
        }
      `;

      const mergeMethodMap = {
        merge: "MERGE",
        squash: "SQUASH",
        rebase: "REBASE",
      };

      await github.graphql(mutation, {
        pullRequestId: pr.node_id,
        mergeMethod: mergeMethodMap[mergeMethod] || "SQUASH",
      });

      console.log(`✅ Auto-merge enabled for PR #${prNumber}`);
    } else {
      // Just log why it's not mergeable, don't disable auto-merge
      console.log(`PR #${prNumber} is not ready for auto-merge`);

      const reasons = [];
      if (!hasApproval) reasons.push("no approval");
      if (qaStatus !== "success") reasons.push(`QA status is ${qaStatus}`);
      if (isDraft) reasons.push("PR is a draft");
      console.log(`Reasons: ${reasons.join(", ")}`);
    }
  } catch (error) {
    // Handle common errors gracefully
    if (error.message.includes("Auto-merge is not enabled")) {
      console.log("ℹ️ Auto-merge is already disabled");
    } else if (error.message.includes("already enabled")) {
      console.log("ℹ️ Auto-merge is already enabled");
    } else if (error.message.includes("Auto-merge is not allowed")) {
      console.log(
        "⚠️ Auto-merge is not allowed for this repository. Please enable it in repository settings."
      );
    } else if (error.message.includes("Pull request is in clean status")) {
      console.log("ℹ️ PR is already up to date with base branch");
    } else if (error.message.includes("Pull request is in dirty status")) {
      console.log("⚠️ PR has conflicts that need to be resolved");
    } else {
      console.log(`❌ Error managing auto-merge: ${error.message}`);
      // Don't throw - we want to handle errors gracefully
    }
  }
}

module.exports = {
  manageAutoMerge,
};
