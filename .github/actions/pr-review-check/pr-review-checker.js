/**
 * PR Review Checker Script
 *
 * Checks pull request approval status and determines QA status.
 * Handles both pull_request and pull_request_review events.
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
 * Check if PR has approval (excluding the PR author)
 *
 * @param {Object} params - Parameters
 * @param {Object} params.github - GitHub API client
 * @param {Object} params.context - GitHub Actions context
 * @param {number} params.prNumber - Pull request number
 * @param {string} params.prAuthor - Pull request author login
 * @returns {Promise<boolean>} Whether PR has approval
 */
async function checkApproval({ github, context, prNumber, prAuthor }) {
  console.log(
    `Checking approval status for PR #${prNumber} (author: ${prAuthor})`
  );

  // Get reviews
  const { data: reviews } = await github.rest.pulls.listReviews({
    owner: context.repo.owner,
    repo: context.repo.repo,
    pull_number: prNumber,
  });

  console.log(`Found ${reviews.length} reviews`);

  // Check if PR has approval (excluding the PR author)
  const approvals = reviews.filter(
    (review) => review.state === "APPROVED" && review.user.login !== prAuthor
  );

  const hasApproval = approvals.length > 0;

  if (hasApproval) {
    console.log(
      `✅ PR has approval from: ${approvals.map((r) => r.user.login).join(", ")}`
    );
  } else {
    console.log(
      "❌ PR does not have approval from anyone other than the author"
    );
  }

  return hasApproval;
}

/**
 * Determine QA status based on event type and inputs
 *
 * @param {Object} params - Parameters
 * @param {Object} params.github - GitHub API client
 * @param {Object} params.context - GitHub Actions context
 * @param {number} params.prNumber - Pull request number
 * @param {string} params.eventName - GitHub event name
 * @param {string} params.qaResult - QA job result (for pull_request events)
 * @param {string} params.secretScanningResult - Secret scanning job result
 * @returns {Promise<string>} QA status (success, failed, running, pending)
 */
async function determineQAStatus({
  github,
  context,
  prNumber,
  eventName,
  qaResult,
  secretScanningResult,
}) {
  console.log(
    `Determining QA status for PR #${prNumber} (event: ${eventName})`
  );

  // For review events, we need to check labels since qa job doesn't run
  if (eventName === "pull_request_review") {
    console.log("Review event - checking labels for QA status");

    // Get current labels
    const { data: pr } = await github.rest.pulls.get({
      owner: context.repo.owner,
      repo: context.repo.repo,
      pull_number: prNumber,
    });

    const labels = pr.labels.map((l) => l.name);
    console.log("Current labels:", labels);

    let qaStatus = "";

    if (labels.includes("qa:success")) {
      qaStatus = "success";
    } else if (labels.includes("qa:failed")) {
      qaStatus = "failed";
    } else if (labels.includes("qa:running")) {
      qaStatus = "running";
    } else if (labels.includes("qa:pending")) {
      qaStatus = "pending";
    } else {
      // No QA label found
      qaStatus = "pending";
      console.log("No QA label found, defaulting to pending");
    }

    console.log(`QA status from labels: ${qaStatus}`);
    return qaStatus;
  } else {
    // For PR events, use the job results
    console.log("PR event - using job results");
    console.log(
      `QA Result: ${qaResult}, Secret Scanning Result: ${secretScanningResult}`
    );

    // Determine overall QA status
    // QA tests are the primary indicator
    let qaStatus;

    if (qaResult === "success") {
      // QA passed - secret scanning is non-blocking (continue-on-error: true)
      qaStatus = "success";
      console.log("✅ QA tests passed");
    } else if (qaResult === "failure" || qaResult === "cancelled") {
      // QA actually failed
      qaStatus = "failed";
      console.log("❌ QA tests failed or were cancelled");
    } else if (qaResult === "skipped" || !qaResult) {
      // QA was skipped (e.g., draft PR) or not run yet
      qaStatus = "pending";
      console.log("⏳ QA tests were skipped or not run yet");
    } else {
      // Default to failed for unknown states
      qaStatus = "failed";
      console.log(`⚠️ Unknown QA result: ${qaResult}, defaulting to failed`);
    }

    return qaStatus;
  }
}

module.exports = {
  checkApproval,
  determineQAStatus,
};
