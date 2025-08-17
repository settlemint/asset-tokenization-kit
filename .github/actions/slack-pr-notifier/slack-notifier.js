/**
 * Slack PR Notifier Script - Efficient Version
 *
 * Key improvements:
 * - Delta-based updates: Only changes what's necessary
 * - Sanity checks: Verifies final state and recovers if needed
 * - Better error handling: slackTs is properly scoped
 * - Comprehensive debugging
 */

// Minimal logging control to reduce verbosity (default: errors only)
(function configureLogging() {
  try {
    const level = (process.env.LOG_LEVEL || "error").toLowerCase();
    const levels = { error: 0, warn: 1, info: 2, debug: 3 };
    const current = levels[level] ?? 0;
    const noop = () => {};
    if (current < 3) console.debug = noop;
    if (current < 2) console.info = noop;
    if (current < 2) console.log = noop; // treat log ~ info
    if (current < 1) console.warn = noop;
  } catch (_) {
    // ignore
  }
})();

/**
 * Calculate the delta between two sets
 */
function calculateDelta(current, desired) {
  const currentSet = new Set(current);
  const desiredSet = new Set(desired);

  const toAdd = desired.filter((item) => !currentSet.has(item));
  const toRemove = current.filter((item) => !desiredSet.has(item));

  return { add: toAdd, remove: toRemove };
}

module.exports = async ({ github, context, core }) => {
  // Get environment variables
  const {
    SLACK_BOT_TOKEN,
    SLACK_CHANNEL_ID,
    PR_NUMBER,
    PR_TITLE,
    PR_URL,
    PR_AUTHOR,
    PR_AUTHOR_TYPE,
    PR_AUTHOR_AVATAR,
    IS_ABANDONED,
    WAIT_TIME = "0", // Avoid static waits; rely on API state instead
    REACTION_DELAY_MS = "0",
    VERIFICATION_DELAY_MS = "0",
  } = process.env;

  console.log("Starting Slack PR notifier for PR #" + PR_NUMBER);
  console.log("Environment:", {
    PR_NUMBER,
    PR_TITLE,
    PR_URL,
    PR_AUTHOR,
    PR_AUTHOR_TYPE,
    IS_ABANDONED,
    WAIT_TIME,
    SLACK_CHANNEL_ID: SLACK_CHANNEL_ID ? "Set" : "Not set",
    SLACK_BOT_TOKEN: SLACK_BOT_TOKEN ? "Set" : "Not set",
  });

  // If Slack credentials are missing, skip notification but don't fail the run
  if (!SLACK_BOT_TOKEN || !SLACK_CHANNEL_ID) {
    console.warn(
      "Missing Slack credentials; skipping PR notification and continuing."
    );
    return;
  }

  // Avoid unconditional waits; only backoff when API indicates instability
  const waitTime = parseInt(WAIT_TIME, 10);
  if (waitTime > 0) {
    console.log(
      `Backoff override set: waiting ${waitTime}ms before proceeding...`
    );
    await new Promise((resolve) => setTimeout(resolve, waitTime));
  }

  // Initialize slackTs at the top level to avoid reference errors
  let slackTs = null;

  try {
    // Check if repository is public
    const { data: repo } = await github.rest.repos.get({
      owner: context.repo.owner,
      repo: context.repo.repo,
    });
    const isPrivateRepo = repo.private;
    console.log(`Repository is ${isPrivateRepo ? "private" : "public"}`);
    // Get PR labels
    let { data: labels } = await github.rest.issues.listLabelsOnIssue({
      owner: context.repo.owner,
      repo: context.repo.repo,
      issue_number: PR_NUMBER,
    });

    // Ensure labels is always an array
    if (!Array.isArray(labels)) {
      console.error("WARNING: Labels response is not an array:", labels);
      labels = [];
    }

    console.log(
      `Found ${labels.length} PR labels:`,
      labels.map((l) => l.name)
    );

    // Also check PR merged status directly from GitHub API
    // This is more reliable than labels for recently merged PRs
    let isPRMerged = false;
    try {
      const { data: pr } = await github.rest.pulls.get({
        owner: context.repo.owner,
        repo: context.repo.repo,
        pull_number: PR_NUMBER,
      });
      isPRMerged = pr.merged === true;
      if (isPRMerged) {
        console.log("PR is merged according to GitHub API");
      }
    } catch (error) {
      console.error("Failed to check PR merged status:", error.message);
    }

    // Get PR comments to find existing Slack timestamp
    const { data: comments } = await github.rest.issues.listComments({
      owner: context.repo.owner,
      repo: context.repo.repo,
      issue_number: PR_NUMBER,
    });

    // Look for existing Slack timestamp in comments
    const slackComment = comments.find(
      (c) => c.body && c.body.includes("<!-- slack-ts:")
    );
    if (slackComment) {
      const match = slackComment.body.match(/<!-- slack-ts:([0-9.]+) -->/);
      if (match) {
        slackTs = match[1];
        console.log("Found existing Slack timestamp:", slackTs);
      }
    } else {
      console.log("No existing Slack timestamp found");
    }

    // Check if PR is from a bot - SKIP ALL BOT PRS
    if (PR_AUTHOR_TYPE === "Bot") {
      console.log(`Skipping notification for bot PR from ${PR_AUTHOR}`);
      return;
    }

    // Check if PR is draft
    const isDraft =
      Array.isArray(labels) &&
      labels.some((label) => label.name === "status:draft");
    if (isDraft) {
      console.log("Skipping notification for draft PR");
      return;
    }

    // Skip if no existing message and PR is merged
    // But allow abandoned PRs to create messages for visibility
    if (
      !slackTs &&
      (labels.some((l) => l.name === "status:merged") || isPRMerged)
    ) {
      console.log(
        "Skipping notification for merged PR without existing message"
      );
      return;
    }

    // Define label mappings
    const statusLabels = [
      { label: "status:draft", text: ":pencil2: Draft" },
      { label: "status:ready-for-review", text: ":mag: Ready for Review" },
      { label: "status:in-review", text: ":eyes: In Review" },
      { label: "qa:running", text: ":hourglass_flowing_sand: QA Running" },
      { label: "qa:failed", text: ":x: QA Failed" },
      { label: "qa:success", text: ":white_check_mark: QA Passed" },
      {
        label: "status:changes-requested",
        text: ":warning: Changes Requested",
      },
      { label: "status:approved", text: ":white_check_mark: Approved" },
      { label: "status:on-hold", text: ":pause_button: On Hold" },
      { label: "status:blocked", text: ":octagonal_sign: Blocked" },
      { label: "status:ready-to-merge", text: ":rocket: Ready to Merge" },
      { label: "status:merged", text: ":tada: Merged" },
    ];

    const priorityLabels = [
      { label: "priority:critical", text: ":rotating_light:" },
      { label: "priority:high", text: ":arrow_up:" },
      { label: "priority:medium", text: ":arrow_right:" },
      { label: "priority:low", text: ":arrow_down:" },
    ];

    const categoryLabels = [
      { label: "type:bug", text: ":bug:" },
      { label: "type:feature", text: ":sparkles:" },
      { label: "type:refactor", text: ":recycle:" },
      { label: "type:test", text: ":test_tube:" },
      { label: "type:docs", text: ":books:" },
      { label: "type:chore", text: ":wrench:" },
      { label: "type:style", text: ":art:" },
      { label: "type:perf", text: ":zap:" },
      { label: "type:security", text: ":shield:" },
      { label: "type:breaking", text: ":boom:" },
    ];

    // Build status text from labels
    const statusTexts = [];
    const activeStatus = statusLabels.find((s) =>
      labels.some((l) => l.name === s.label)
    );
    if (activeStatus) statusTexts.push(activeStatus.text);

    const activePriority = priorityLabels.find((p) =>
      labels.some((l) => l.name === p.label)
    );
    if (activePriority) statusTexts.push(activePriority.text);

    const activeCategories = categoryLabels.filter((c) =>
      labels.some((l) => l.name === c.label)
    );
    statusTexts.push(...activeCategories.map((c) => c.text));

    const statusString =
      statusTexts.length > 0 ? statusTexts.join(" ") + " " : "";

    // Slack API helper with enhanced debugging and exponential backoff
    async function slackApi(method, params, maxRetries = 3) {
      let lastError;

      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        const startTime = Date.now();

        if (attempt > 0) {
          const backoffTime = Math.min(1000 * Math.pow(2, attempt - 1), 10000); // Max 10 seconds
          console.log(
            `Retry attempt ${attempt}/${maxRetries} after ${backoffTime}ms backoff`
          );
          await new Promise((resolve) => setTimeout(resolve, backoffTime));
        }

        console.log(
          `[${new Date().toISOString()}] Calling Slack API: ${method} (attempt ${attempt + 1})`
        );
        console.log("Request params:", JSON.stringify(params, null, 2));

        try {
          const response = await fetch(`https://slack.com/api/${method}`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${SLACK_BOT_TOKEN}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(params),
          });

          const data = await response.json();
          const duration = Date.now() - startTime;

          if (data.ok) {
            console.log(`✓ Slack API ${method} succeeded in ${duration}ms`);
            // Log specific useful response data
            if (method === "conversations.history" && data.messages) {
              console.log(`  Found ${data.messages.length} messages`);
            }
            if (method === "chat.postMessage" && data.ts) {
              console.log(`  Message posted with timestamp: ${data.ts}`);
            }
            return data;
          } else {
            console.error(
              `✗ Slack API ${method} failed in ${duration}ms:`,
              data.error
            );

            // Handle specific errors
            if (data.error === "missing_scope") {
              console.error(
                `  Required scope for ${method}: Check Slack app permissions`
              );
              throw new Error(`Slack API error: ${data.error}`); // Don't retry permission errors
            }
            if (data.error === "not_in_channel") {
              console.error(`  Bot is not in channel ${SLACK_CHANNEL_ID}`);
              throw new Error(`Slack API error: ${data.error}`); // Don't retry channel errors
            }
            if (data.error === "channel_not_found") {
              console.error(`  Channel ${SLACK_CHANNEL_ID} not found`);
              throw new Error(`Slack API error: ${data.error}`); // Don't retry missing channel
            }
            if (data.error === "rate_limited") {
              const retryAfter = data.retry_after || 60;
              console.error(
                `  Rate limited. Retry after: ${retryAfter} seconds`
              );
              if (attempt < maxRetries) {
                await new Promise((resolve) =>
                  setTimeout(resolve, retryAfter * 1000)
                );
                continue; // Retry after rate limit wait
              }
            }

            // For other errors, store and maybe retry
            lastError = new Error(`Slack API error: ${data.error}`);
            if (attempt === maxRetries) {
              throw lastError;
            }
          }
        } catch (error) {
          const duration = Date.now() - startTime;
          console.error(
            `✗ Slack API ${method} failed with exception in ${duration}ms:`,
            error.message
          );

          // Network errors are retryable
          if (
            error.message.includes("fetch failed") ||
            error.message.includes("ECONNRESET")
          ) {
            lastError = error;
            if (attempt === maxRetries) {
              throw error;
            }
            continue;
          }

          // Non-retryable errors
          throw error;
        }
      }

      throw lastError || new Error(`Failed after ${maxRetries} retries`);
    }

    // Escape text for Slack
    function escapeText(text) {
      return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
    }

    const isMerged =
      labels.some((l) => l.name === "status:merged") || isPRMerged;
    const isAbandoned = IS_ABANDONED === "true";
    const escapedTitle = escapeText(PR_TITLE);

    // Build message blocks
    let messageBlocks;
    if (isMerged) {
      messageBlocks = [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `:tada: ${escapedTitle}`,
          },
          accessory: {
            type: "button",
            text: {
              type: "plain_text",
              text: "View PR",
              emoji: false,
            },
            url: PR_URL,
            style: "primary",
          },
        },
      ];
    } else if (isAbandoned) {
      messageBlocks = [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `:file_folder: ${escapedTitle}`,
          },
          accessory: {
            type: "button",
            text: {
              type: "plain_text",
              text: "View PR",
              emoji: false,
            },
            url: PR_URL,
          },
        },
      ];
    } else {
      // For private repositories, use simplified blocks instead of OpenGraph image
      if (isPrivateRepo) {
        messageBlocks = [
          {
            type: "header",
            text: {
              type: "plain_text",
              text: `#${PR_NUMBER} ${escapedTitle}`,
              emoji: false,
            },
          },
          {
            type: "section",
            fields: [
              {
                type: "mrkdwn",
                text: `*Repository:*\n${context.repo.owner}/${context.repo.repo}`,
              },
              {
                type: "mrkdwn",
                text: `*Author:*\n${PR_AUTHOR}`,
              },
            ],
          },
        ];

        // Add status context if available
        if (statusString.trim()) {
          messageBlocks.push({
            type: "context",
            elements: [
              {
                type: "mrkdwn",
                text: statusString.trim(),
              },
            ],
          });
        }

        // Add action buttons
        messageBlocks.push({
          type: "actions",
          elements: [
            {
              type: "button",
              text: {
                type: "plain_text",
                text: "View PR",
                emoji: false,
              },
              url: PR_URL,
              style: "primary",
            },
            {
              type: "button",
              text: {
                type: "plain_text",
                text: "Files",
                emoji: false,
              },
              url: `${PR_URL}/files`,
            },
            {
              type: "button",
              text: {
                type: "plain_text",
                text: "Checks",
                emoji: false,
              },
              url: `${PR_URL}/checks`,
            },
          ],
        });
      } else {
        // Public repository - use OpenGraph image
        let ogImageUrl;
        if (!slackTs) {
          // New message - use timestamp-based cache busting for QA running
          const qaRunning = labels.some((l) => l.name === "qa:running");
          const cacheKey = qaRunning ? `qa-${Date.now()}` : Date.now();
          ogImageUrl = `https://opengraph.githubassets.com/${cacheKey}/${context.repo.owner}/${context.repo.repo}/pull/${PR_NUMBER}`;
        } else {
          // Update - use stable URL
          ogImageUrl = `https://opengraph.githubassets.com/1/${context.repo.owner}/${context.repo.repo}/pull/${PR_NUMBER}`;
        }

        messageBlocks = [
          {
            type: "image",
            image_url: ogImageUrl,
            alt_text: `PR #${PR_NUMBER}: ${escapedTitle}`,
          },
          {
            type: "actions",
            elements: [
              {
                type: "button",
                text: {
                  type: "plain_text",
                  text: "View PR",
                  emoji: false,
                },
                url: PR_URL,
                style: "primary",
              },
              {
                type: "button",
                text: {
                  type: "plain_text",
                  text: "Files",
                  emoji: false,
                },
                url: `${PR_URL}/files`,
              },
              {
                type: "button",
                text: {
                  type: "plain_text",
                  text: "Checks",
                  emoji: false,
                },
                url: `${PR_URL}/checks`,
              },
            ],
          },
        ];
      }
    }

    // Send or update message with retry logic
    async function sendMessage(isNew) {
      let result;
      let retryCount = 0;
      const maxRetries = 2;

      while (retryCount <= maxRetries) {
        try {
          if (isNew) {
            result = await slackApi("chat.postMessage", {
              channel: SLACK_CHANNEL_ID,
              text: `#${PR_NUMBER}: ${escapedTitle}`,
              blocks: messageBlocks,
            });
          } else {
            await slackApi("chat.update", {
              channel: SLACK_CHANNEL_ID,
              ts: slackTs,
              text: `#${PR_NUMBER}: ${escapedTitle}`,
              blocks: messageBlocks,
            });
          }
          break;
        } catch (error) {
          if (
            error.message.includes("invalid_blocks") &&
            retryCount < maxRetries
          ) {
            retryCount++;
            await new Promise((resolve) =>
              setTimeout(resolve, 1000 * retryCount)
            );
          } else if (error.message.includes("invalid_blocks")) {
            // Fallback to simpler text-only blocks
            let fallbackBlocks;

            if (isMerged || isAbandoned) {
              // For merged/abandoned, keep the simple format
              fallbackBlocks = messageBlocks;
            } else {
              // For active PRs, create a simplified block structure
              fallbackBlocks = [
                {
                  type: "section",
                  text: {
                    type: "mrkdwn",
                    text: `*<${PR_URL}|#${PR_NUMBER} ${escapedTitle}>*\n_Author: ${PR_AUTHOR} • Repo: ${context.repo.owner}/${context.repo.repo}_`,
                  },
                },
                {
                  type: "actions",
                  elements: [
                    {
                      type: "button",
                      text: {
                        type: "plain_text",
                        text: "View PR",
                        emoji: false,
                      },
                      url: PR_URL,
                      style: "primary",
                    },
                  ],
                },
              ];
            }

            if (isNew) {
              result = await slackApi("chat.postMessage", {
                channel: SLACK_CHANNEL_ID,
                text: `#${PR_NUMBER}: ${escapedTitle}`,
                blocks: fallbackBlocks,
              });
            } else {
              await slackApi("chat.update", {
                channel: SLACK_CHANNEL_ID,
                ts: slackTs,
                text: `#${PR_NUMBER}: ${escapedTitle}`,
                blocks: fallbackBlocks,
              });
            }
            break;
          } else {
            throw error;
          }
        }
      }
      return result;
    }

    // Handle new message creation
    if (!slackTs) {
      console.log("Creating new Slack message...");

      // Create a lock comment to prevent race conditions
      const lockComment = await github.rest.issues.createComment({
        owner: context.repo.owner,
        repo: context.repo.repo,
        issue_number: PR_NUMBER,
        body: "<!-- slack-creating-lock -->",
      });

      console.log("Created lock comment with ID:", lockComment.data.id);

      // Check again for existing Slack comments (race condition check)
      const { data: currentComments } = await github.rest.issues.listComments({
        owner: context.repo.owner,
        repo: context.repo.repo,
        issue_number: PR_NUMBER,
      });

      const existingComment = currentComments.find(
        (c) =>
          c.body &&
          c.body.includes("<!-- slack-ts:") &&
          c.id !== lockComment.data.id
      );

      if (existingComment) {
        // Another process already created the message
        await github.rest.issues.deleteComment({
          owner: context.repo.owner,
          repo: context.repo.repo,
          comment_id: lockComment.data.id,
        });

        const match = existingComment.body.match(/<!-- slack-ts:([0-9.]+) -->/);
        if (match) {
          slackTs = match[1];
        }
      } else {
        // Create new Slack message
        const result = await sendMessage(true);

        if (result && result.ts) {
          // Update the lock comment with the Slack timestamp
          const commentBody = [
            `<!-- slack-ts:${result.ts} -->`,
            `To view in Slack, search for: ${result.ts}`,
          ].join("\n");

          await github.rest.issues.updateComment({
            owner: context.repo.owner,
            repo: context.repo.repo,
            comment_id: lockComment.data.id,
            body: commentBody,
          });

          slackTs = result.ts;
        } else {
          // Clean up lock comment if message creation failed
          try {
            await github.rest.issues.deleteComment({
              owner: context.repo.owner,
              repo: context.repo.repo,
              comment_id: lockComment.data.id,
            });
          } catch (e) {
            // Ignore deletion errors
          }
        }
      }
    } else {
      // Update existing message
      await sendMessage(false);
    }

    // EFFICIENT REACTION MANAGEMENT
    if (slackTs) {
      await manageReactionsEfficiently(
        slackTs,
        labels,
        isPRMerged,
        slackApi,
        SLACK_CHANNEL_ID
      );
    }
  } catch (error) {
    if (String(error.message).includes("not_authed")) {
      console.warn(
        "Slack authentication failed; skipping notification without failing run."
      );
      return;
    }
    console.error("❌ CRITICAL ERROR in Slack notifier:", error.message);
    console.error("Stack trace:", error.stack);
    console.error("\n=== EXECUTION CONTEXT ===");
    console.error("PR Number:", PR_NUMBER);
    console.error("PR Title:", PR_TITLE);
    console.error("PR Author:", PR_AUTHOR);
    console.error("Author Type:", PR_AUTHOR_TYPE);
    console.error("Channel ID:", SLACK_CHANNEL_ID ? "Set" : "Not set");
    console.error("Bot Token:", SLACK_BOT_TOKEN ? "Set" : "Not set");
    console.error("Slack Timestamp:", slackTs || "Not set");
    throw error;
  }

  console.log("\n=== SLACK NOTIFIER COMPLETED SUCCESSFULLY ===");
  console.log(`PR #${PR_NUMBER} processed`);
  console.log(`Slack timestamp: ${slackTs || "New message created"}`);
};

/**
 * Efficiently manage reactions - only add/remove what's necessary
 */
async function manageReactionsEfficiently(
  slackTs,
  labels,
  isPRMerged,
  slackApi,
  SLACK_CHANNEL_ID
) {
  // Optional small backoff; default to 0 to avoid static waits
  const reactionInitDelay = parseInt(process.env.REACTION_DELAY_MS || "0", 10);
  if (reactionInitDelay > 0) {
    await new Promise((resolve) => setTimeout(resolve, reactionInitDelay));
  }

  // Define reaction mappings from the ORIGINAL working version
  const statusReactions = {
    "qa:pending": "hourglass_flowing_sand",
    "qa:running": "runner",
    "qa:success": "white_check_mark",
    "qa:failed": "x",
    "status:ready-for-review": "eyes",
    "status:approved": "thumbsup",
    "status:mergeable": "rocket",
    // Note: status:merged is intentionally not mapped - merged PRs should have no reactions
  };

  // Define mutually exclusive groups (only one can be active at a time)
  const exclusiveGroups = {
    qa: ["hourglass_flowing_sand", "runner", "white_check_mark", "x"],
    status: ["eyes", "thumbsup", "rocket"],
  };

  // All possible status reactions we manage
  const allStatusReactions = new Set(Object.values(statusReactions));

  try {
    // Get message to ensure it exists
    const messages = await slackApi("conversations.history", {
      channel: SLACK_CHANNEL_ID,
      latest: slackTs,
      limit: 1,
      inclusive: true,
    });

    if (!messages.messages || messages.messages.length === 0) {
      console.warn("⚠️ No message found in Slack for timestamp:", slackTs);
      return;
    }

    const message = messages.messages[0];
    console.log("Message found for reaction management");

    // Get current reactions
    const currentReactions = (message.reactions || [])
      .filter((r) => r.users && r.users.length > 0)
      .map((r) => r.name);

    console.log(`Current reactions: [${currentReactions.join(", ")}]`);

    // Calculate desired reactions based on labels
    const desiredReactions = calculateDesiredReactions(
      labels,
      isPRMerged,
      statusReactions,
      exclusiveGroups
    );

    console.log(`Desired reactions: [${desiredReactions.join(", ")}]`);

    // Calculate delta (what to add/remove) - only for reactions we manage
    const currentManagedReactions = currentReactions.filter((r) =>
      allStatusReactions.has(r)
    );
    const delta = calculateDelta(currentManagedReactions, desiredReactions);

    console.log("\n=== EFFICIENT REACTION UPDATE PLAN ===");
    console.log(`Reactions to add: [${delta.add.join(", ")}]`);
    console.log(`Reactions to remove: [${delta.remove.join(", ")}]`);

    // Apply changes
    let changesMade = 0;
    const errors = [];

    // Remove reactions first
    for (const reaction of delta.remove) {
      try {
        console.log(`Removing reaction: ${reaction}`);
        await slackApi("reactions.remove", {
          channel: SLACK_CHANNEL_ID,
          timestamp: slackTs,
          name: reaction,
        });
        changesMade++;
        const delay = parseInt(REACTION_DELAY_MS, 10) || 0;
        if (delay > 0) {
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      } catch (error) {
        if (error.message.includes("no_reaction")) {
          console.log(
            `Reaction ${reaction} was already removed (race condition)`
          );
        } else {
          errors.push(`Failed to remove ${reaction}: ${error.message}`);
          console.error(
            `Failed to remove reaction ${reaction}:`,
            error.message
          );
        }
      }
    }

    // Add reactions
    for (const reaction of delta.add) {
      try {
        console.log(`Adding reaction: ${reaction}`);
        await slackApi("reactions.add", {
          channel: SLACK_CHANNEL_ID,
          timestamp: slackTs,
          name: reaction,
        });
        changesMade++;
        const delay = parseInt(REACTION_DELAY_MS, 10) || 0;
        if (delay > 0) {
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      } catch (error) {
        if (error.message.includes("already_reacted")) {
          console.log(`Reaction ${reaction} already exists (race condition)`);
        } else {
          errors.push(`Failed to add ${reaction}: ${error.message}`);
          console.error(`Failed to add reaction ${reaction}:`, error.message);
        }
      }
    }

    console.log(`\n✓ Applied ${changesMade} reaction changes`);

    // SANITY CHECK: Verify final state if we made changes
    if (changesMade > 0 || errors.length > 0) {
      await verifySanity(
        slackTs,
        desiredReactions,
        allStatusReactions,
        slackApi,
        SLACK_CHANNEL_ID
      );
    }
  } catch (error) {
    console.error("Failed to manage reactions:", error.message);
    console.error("Stack trace:", error.stack);
  }
}

/**
 * Calculate desired reactions based on labels and rules
 */
function calculateDesiredReactions(
  labels,
  isPRMerged,
  statusReactions,
  exclusiveGroups
) {
  console.log("\n=== CALCULATING DESIRED REACTIONS ===");

  // Check if PR is merged - if so, we want NO reactions
  // Check both the label AND the actual PR merge state for reliability
  const isMerged = labels.some((l) => l.name === "status:merged") || isPRMerged;
  if (isMerged) {
    console.log("PR is merged - no reactions should be displayed");
    return [];
  }

  // Map labels to reactions
  const mappedReactions = [];
  for (const label of labels) {
    if (statusReactions[label.name]) {
      mappedReactions.push(statusReactions[label.name]);
      console.log(
        `Label "${label.name}" → reaction "${statusReactions[label.name]}"`
      );
    }
  }

  // Apply exclusive group rules
  const finalReactions = [];
  const groupPriority = {
    qa: ["qa:failed", "qa:success", "qa:running", "qa:pending"],
    status: [
      "status:merged",
      "status:mergeable",
      "status:approved",
      "status:ready-for-review",
    ],
  };

  // For each group, pick only the highest priority reaction
  for (const [groupName, groupReactions] of Object.entries(exclusiveGroups)) {
    const priorityOrder = groupPriority[groupName] || [];

    // Find the highest priority label from this group
    let selectedReaction = null;
    for (const priorityLabel of priorityOrder) {
      if (
        labels.some((l) => l.name === priorityLabel) &&
        statusReactions[priorityLabel]
      ) {
        selectedReaction = statusReactions[priorityLabel];
        console.log(
          `Selected reaction "${selectedReaction}" for group "${groupName}"`
        );
        break;
      }
    }

    if (selectedReaction && mappedReactions.includes(selectedReaction)) {
      finalReactions.push(selectedReaction);
    }
  }

  // If QA is running or pending, only show QA reactions
  const hasQaInProgress = labels.some(
    (l) => l.name === "qa:running" || l.name === "qa:pending"
  );
  if (hasQaInProgress) {
    console.log("QA in progress - filtering to only QA reactions");
    return finalReactions.filter((r) => exclusiveGroups.qa.includes(r));
  }

  return finalReactions;
}

/**
 * Verify the final state matches our expectations
 */
async function verifySanity(
  slackTs,
  desiredReactions,
  allStatusReactions,
  slackApi,
  SLACK_CHANNEL_ID
) {
  console.log("\n=== SANITY CHECK ===");

  // Optional verify backoff; default to 0 to avoid static waits
  const verifyDelay = parseInt(process.env.VERIFICATION_DELAY_MS || "0", 10);
  if (verifyDelay > 0) {
    await new Promise((resolve) => setTimeout(resolve, verifyDelay));
  }

  try {
    // Re-fetch the message
    const messages = await slackApi("conversations.history", {
      channel: SLACK_CHANNEL_ID,
      latest: slackTs,
      limit: 1,
      inclusive: true,
    });

    if (!messages.messages || messages.messages.length === 0) {
      console.error("❌ SANITY CHECK FAILED: Message disappeared!");
      return;
    }

    const message = messages.messages[0];
    const actualReactions = (message.reactions || [])
      .filter((r) => r.users && r.users.length > 0)
      .map((r) => r.name);

    // Get only managed reactions
    const actualManagedReactions = actualReactions.filter((r) =>
      allStatusReactions.has(r)
    );

    // Compare
    const desiredArray = desiredReactions.sort();
    const actualArray = actualManagedReactions.sort();

    console.log(`Expected reactions: [${desiredArray.join(", ")}]`);
    console.log(`Actual reactions:   [${actualArray.join(", ")}]`);

    if (JSON.stringify(desiredArray) === JSON.stringify(actualArray)) {
      console.log("✅ SANITY CHECK PASSED: Reactions are correct");
    } else {
      console.error("❌ SANITY CHECK FAILED: Reactions mismatch!");

      // Calculate what's wrong
      const missing = desiredArray.filter((r) => !actualArray.includes(r));
      const extra = actualArray.filter((r) => !desiredArray.includes(r));

      if (missing.length > 0) {
        console.error(`Missing reactions: [${missing.join(", ")}]`);
      }
      if (extra.length > 0) {
        console.error(`Extra reactions: [${extra.join(", ")}]`);
      }

      // Attempt recovery
      console.log("\n🔧 ATTEMPTING FULL RESET...");

      // Remove all managed reactions
      for (const reaction of actualManagedReactions) {
        try {
          await slackApi("reactions.remove", {
            channel: SLACK_CHANNEL_ID,
            timestamp: slackTs,
            name: reaction,
          });
          const delay = parseInt(process.env.REACTION_DELAY_MS || "0", 10);
          if (delay > 0) {
            await new Promise((resolve) => setTimeout(resolve, delay));
          }
        } catch (e) {
          console.error(
            `Failed to remove ${reaction} during reset:`,
            e.message
          );
        }
      }

      // Add all desired reactions
      for (const reaction of desiredReactions) {
        try {
          await slackApi("reactions.add", {
            channel: SLACK_CHANNEL_ID,
            timestamp: slackTs,
            name: reaction,
          });
          const delay = parseInt(process.env.REACTION_DELAY_MS || "0", 10);
          if (delay > 0) {
            await new Promise((resolve) => setTimeout(resolve, delay));
          }
        } catch (e) {
          console.error(`Failed to add ${reaction} during reset:`, e.message);
        }
      }

      console.log("Full reset completed");
    }
  } catch (error) {
    console.error("Failed to perform sanity check:", error.message);
  }
}
