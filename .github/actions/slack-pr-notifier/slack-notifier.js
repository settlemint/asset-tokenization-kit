/**
 * Slack PR Notifier Script
 * 
 * This script handles sending and updating Slack notifications for PR events.
 * It manages message formatting, reactions, and maintains state through GitHub comments.
 */

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
    IS_ABANDONED
  } = process.env;

  console.log('Starting Slack PR notifier for PR #' + PR_NUMBER);
  console.log('Environment:', {
    PR_NUMBER,
    PR_TITLE,
    PR_URL,
    PR_AUTHOR,
    PR_AUTHOR_TYPE,
    IS_ABANDONED,
    SLACK_CHANNEL_ID: SLACK_CHANNEL_ID ? 'Set' : 'Not set',
    SLACK_BOT_TOKEN: SLACK_BOT_TOKEN ? 'Set' : 'Not set'
  });

  try {
    // Get PR labels
    const { data: labels } = await github.rest.issues.listLabelsOnIssue({
      owner: context.repo.owner,
      repo: context.repo.repo,
      issue_number: PR_NUMBER
    });
    
    console.log('PR labels:', labels.map(l => l.name));

    // Get PR comments to find existing Slack timestamp
    const { data: comments } = await github.rest.issues.listComments({
      owner: context.repo.owner,
      repo: context.repo.repo,
      issue_number: PR_NUMBER
    });

    // Look for existing Slack timestamp in comments
    let slackTs = null;
    const slackComment = comments.find(c => c.body && c.body.includes('<!-- slack-ts:'));
    if (slackComment) {
      const match = slackComment.body.match(/<!-- slack-ts:([0-9.]+) -->/);
      if (match) {
        slackTs = match[1];
        console.log('Found existing Slack timestamp:', slackTs);
      }
    } else {
      console.log('No existing Slack timestamp found');
    }

    // Filter for allowed bots
    const allowedBots = ['dependabot[bot]', 'renovate[bot]', 'github-actions[bot]'];
    if (PR_AUTHOR_TYPE === 'Bot' && !allowedBots.includes(PR_AUTHOR)) {
      console.log('Skipping notification for non-allowed bot:', PR_AUTHOR);
      return;
    }

    // Skip draft PRs (unless from bot)
    const isDraft = labels.some(l => l.name === 'status:draft');
    if (isDraft && PR_AUTHOR_TYPE !== 'Bot') {
      console.log('Skipping notification for draft PR from non-bot author');
      return;
    }

    // Skip if no existing message and PR is merged or abandoned
    if (!slackTs && (labels.some(l => l.name === 'status:merged') || IS_ABANDONED === 'true')) {
      console.log('Skipping notification for merged/abandoned PR without existing message');
      return;
    }

    // Define label mappings
    const statusLabels = [
      { label: 'status:draft', text: ':pencil2: Draft' },
      { label: 'status:ready-for-review', text: ':mag: Ready for Review' },
      { label: 'status:in-review', text: ':eyes: In Review' },
      { label: 'qa:running', text: ':hourglass_flowing_sand: QA Running' },
      { label: 'qa:failed', text: ':x: QA Failed' },
      { label: 'qa:passed', text: ':white_check_mark: QA Passed' },
      { label: 'status:changes-requested', text: ':warning: Changes Requested' },
      { label: 'status:approved', text: ':white_check_mark: Approved' },
      { label: 'status:on-hold', text: ':pause_button: On Hold' },
      { label: 'status:blocked', text: ':octagonal_sign: Blocked' },
      { label: 'status:ready-to-merge', text: ':rocket: Ready to Merge' },
      { label: 'status:merged', text: ':tada: Merged' }
    ];

    const priorityLabels = [
      { label: 'priority:critical', text: ':rotating_light:' },
      { label: 'priority:high', text: ':arrow_up:' },
      { label: 'priority:medium', text: ':arrow_right:' },
      { label: 'priority:low', text: ':arrow_down:' }
    ];

    const categoryLabels = [
      { label: 'type:bug', text: ':bug:' },
      { label: 'type:feature', text: ':sparkles:' },
      { label: 'type:refactor', text: ':recycle:' },
      { label: 'type:test', text: ':test_tube:' },
      { label: 'type:docs', text: ':books:' },
      { label: 'type:chore', text: ':wrench:' },
      { label: 'type:style', text: ':art:' },
      { label: 'type:perf', text: ':zap:' },
      { label: 'type:security', text: ':shield:' },
      { label: 'type:breaking', text: ':boom:' }
    ];

    // Build status text from labels
    const statusTexts = [];
    const activeStatus = statusLabels.find(s => labels.some(l => l.name === s.label));
    if (activeStatus) statusTexts.push(activeStatus.text);
    
    const activePriority = priorityLabels.find(p => labels.some(l => l.name === p.label));
    if (activePriority) statusTexts.push(activePriority.text);
    
    const activeCategories = categoryLabels.filter(c => labels.some(l => l.name === c.label));
    statusTexts.push(...activeCategories.map(c => c.text));
    
    const statusString = statusTexts.length > 0 ? statusTexts.join(' ') + ' ' : '';

    // Slack API helper
    async function slackApi(method, params) {
      console.log(`Calling Slack API: ${method}`, JSON.stringify(params, null, 2));
      
      const response = await fetch(`https://slack.com/api/${method}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SLACK_BOT_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(params)
      });
      
      const data = await response.json();
      console.log(`Slack API response for ${method}:`, data.ok ? 'Success' : `Error: ${data.error}`);
      
      if (!data.ok) {
        throw new Error(`Slack API error: ${data.error}`);
      }
      return data;
    }

    // Escape text for Slack
    function escapeText(text) {
      return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
    }

    const isMerged = labels.some(l => l.name === 'status:merged');
    const isAbandoned = IS_ABANDONED === 'true';
    const escapedTitle = escapeText(PR_TITLE);

    // Build message blocks
    let messageBlocks;
    if (isMerged) {
      messageBlocks = [{
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `:tada: ${escapedTitle}`
        },
        accessory: {
          type: 'button',
          text: {
            type: 'plain_text',
            text: 'View PR',
            emoji: false
          },
          url: PR_URL,
          style: 'primary'
        }
      }];
    } else if (isAbandoned) {
      messageBlocks = [{
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `:file_folder: ${escapedTitle}`
        },
        accessory: {
          type: 'button',
          text: {
            type: 'plain_text',
            text: 'View PR',
            emoji: false
          },
          url: PR_URL
        }
      }];
    } else {
      // Generate OpenGraph image URL
      let ogImageUrl;
      if (!slackTs) {
        // New message - use timestamp-based cache busting for QA running
        const qaRunning = labels.some(l => l.name === 'qa:running');
        const cacheKey = qaRunning ? `qa-${Date.now()}` : Date.now();
        ogImageUrl = `https://opengraph.githubassets.com/${cacheKey}/${context.repo.owner}/${context.repo.repo}/pull/${PR_NUMBER}`;
      } else {
        // Update - use stable URL
        ogImageUrl = `https://opengraph.githubassets.com/1/${context.repo.owner}/${context.repo.repo}/pull/${PR_NUMBER}`;
      }

      messageBlocks = [
        {
          type: 'image',
          image_url: ogImageUrl,
          alt_text: `PR #${PR_NUMBER}: ${escapedTitle}`
        },
        {
          type: 'actions',
          elements: [
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: 'View PR',
                emoji: false
              },
              url: PR_URL,
              style: 'primary'
            },
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: 'Files',
                emoji: false
              },
              url: `${PR_URL}/files`
            },
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: 'Checks',
                emoji: false
              },
              url: `${PR_URL}/checks`
            }
          ]
        }
      ];
    }

    // Send or update message with retry logic
    async function sendMessage(isNew) {
      let result;
      let retryCount = 0;
      const maxRetries = 2;

      while (retryCount <= maxRetries) {
        try {
          if (isNew) {
            result = await slackApi('chat.postMessage', {
              channel: SLACK_CHANNEL_ID,
              text: `#${PR_NUMBER}: ${escapedTitle}`,
              blocks: messageBlocks
            });
          } else {
            await slackApi('chat.update', {
              channel: SLACK_CHANNEL_ID,
              ts: slackTs,
              text: `#${PR_NUMBER}: ${escapedTitle}`,
              blocks: messageBlocks
            });
          }
          break;
        } catch (error) {
          if (error.message.includes('invalid_blocks') && retryCount < maxRetries) {
            retryCount++;
            await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
          } else if (error.message.includes('invalid_blocks')) {
            // Fallback to text-only blocks
            const fallbackBlocks = messageBlocks.filter(b => b.type !== 'image');
            if (!isMerged && !isAbandoned) {
              fallbackBlocks.unshift({
                type: 'section',
                text: {
                  type: 'mrkdwn',
                  text: `*<${PR_URL}|#${PR_NUMBER}: ${escapedTitle}>*\n_by ${PR_AUTHOR}_`
                }
              });
            }

            if (isNew) {
              result = await slackApi('chat.postMessage', {
                channel: SLACK_CHANNEL_ID,
                text: `#${PR_NUMBER}: ${escapedTitle}`,
                blocks: fallbackBlocks
              });
            } else {
              await slackApi('chat.update', {
                channel: SLACK_CHANNEL_ID,
                ts: slackTs,
                text: `#${PR_NUMBER}: ${escapedTitle}`,
                blocks: fallbackBlocks
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
      console.log('Creating new Slack message...');
      
      // Create a lock comment to prevent race conditions
      const lockComment = await github.rest.issues.createComment({
        owner: context.repo.owner,
        repo: context.repo.repo,
        issue_number: PR_NUMBER,
        body: '<!-- slack-creating-lock -->'
      });
      
      console.log('Created lock comment with ID:', lockComment.data.id);

      // Check again for existing Slack comments (race condition check)
      const { data: currentComments } = await github.rest.issues.listComments({
        owner: context.repo.owner,
        repo: context.repo.repo,
        issue_number: PR_NUMBER
      });

      const existingComment = currentComments.find(c => 
        c.body && c.body.includes('<!-- slack-ts:') && c.id !== lockComment.data.id
      );

      if (existingComment) {
        // Another process already created the message
        await github.rest.issues.deleteComment({
          owner: context.repo.owner,
          repo: context.repo.repo,
          comment_id: lockComment.data.id
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
            `To view in Slack, search for: ${result.ts}`
          ].join('\n');
          
          await github.rest.issues.updateComment({
            owner: context.repo.owner,
            repo: context.repo.repo,
            comment_id: lockComment.data.id,
            body: commentBody
          });
          
          slackTs = result.ts;
        } else {
          // Clean up lock comment if message creation failed
          try {
            await github.rest.issues.deleteComment({
              owner: context.repo.owner,
              repo: context.repo.repo,
              comment_id: lockComment.data.id
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

    // Add/remove reactions based on labels
    if (slackTs) {
      // Wait a bit for message to be fully processed
      await new Promise(resolve => setTimeout(resolve, 500));

      // Define reaction mappings from the ORIGINAL working version
      const statusReactions = {
        'qa:pending': 'hourglass_flowing_sand',
        'qa:running': 'runner',
        'qa:success': 'white_check_mark',
        'qa:failed': 'x',
        'status:ready-for-review': 'eyes',
        'status:approved': 'thumbsup',
        'status:mergeable': 'rocket',
        'status:merged': 'tada'
      };

      // Define mutually exclusive groups (only one can be active at a time)
      const exclusiveGroups = {
        'qa': ['hourglass_flowing_sand', 'runner', 'white_check_mark', 'x'],
        'status': ['eyes', 'thumbsup', 'rocket', 'tada']
      };

      // All possible status reactions we manage
      const allStatusReactions = Object.values(statusReactions);

      try {
        // Get message to ensure it exists
        const messages = await slackApi('conversations.history', {
          channel: SLACK_CHANNEL_ID,
          latest: slackTs,
          limit: 1,
          inclusive: true
        });

        if (messages.messages && messages.messages.length > 0) {
          console.log('Message found, processing reactions...');
          
          // Get reactions from the message we already fetched
          const message = messages.messages[0];
          const existingReactions = (message.reactions || [])
            .map(r => r.name);
            
          console.log('Existing reactions:', existingReactions);

          // STRICT LABEL-TO-REACTION MAPPING
          // Only show reactions that have exact corresponding labels
          const currentStatuses = [];

          // Map each label to its reaction
          for (const label of labels) {
            if (statusReactions[label.name]) {
              currentStatuses.push(statusReactions[label.name]);
              console.log(`Label "${label.name}" maps to reaction "${statusReactions[label.name]}"`);
            }
          }

          // Apply exclusive group rules
          const finalStatuses = [];
          const usedGroups = new Set();

          // Priority order for exclusive groups
          const groupPriority = {
            'qa': ['qa:failed', 'qa:success', 'qa:running', 'qa:pending'],
            'status': ['status:merged', 'status:mergeable', 'status:approved', 'status:ready-for-review']
          };

          // For each group, pick only the highest priority reaction
          for (const [groupName, groupReactions] of Object.entries(exclusiveGroups)) {
            const priorityOrder = groupPriority[groupName] || [];

            // Find the highest priority label from this group
            let selectedReaction = null;
            for (const priorityLabel of priorityOrder) {
              if (labels.some(l => l.name === priorityLabel) && statusReactions[priorityLabel]) {
                selectedReaction = statusReactions[priorityLabel];
                break;
              }
            }

            if (selectedReaction && currentStatuses.includes(selectedReaction)) {
              finalStatuses.push(selectedReaction);
              usedGroups.add(groupName);
            }
          }

          // If QA is running or pending, don't show status reactions
          const hasQaInProgress = labels.some(l => l.name === 'qa:running' || l.name === 'qa:pending');
          const filteredStatuses = hasQaInProgress
            ? finalStatuses.filter(r => exclusiveGroups.qa.includes(r))
            : finalStatuses;

          console.log('Final reactions (strict sync with labels):', filteredStatuses);

          // Determine what reactions to remove and add
          let reactionsToRemove, reactionsToAdd;

          const isMerged = labels.some(l => l.name === 'status:merged');
          
          if (isMerged) {
            // For merged PRs, remove ALL managed reactions
            reactionsToRemove = existingReactions.filter(reaction =>
              allStatusReactions.includes(reaction)
            );
            reactionsToAdd = [];
          } else {
            // Remove any reaction that doesn't have a corresponding label
            reactionsToRemove = existingReactions.filter(reaction => {
              // Check if this is a managed reaction
              if (!allStatusReactions.includes(reaction)) {
                return false; // Don't remove reactions we don't manage
              }

              // Check if this reaction has a corresponding current label
              return !filteredStatuses.includes(reaction);
            });

            // Only add reactions that correspond to current labels and aren't already present
            reactionsToAdd = filteredStatuses.filter(reaction =>
              !existingReactions.includes(reaction)
            );
          }

          console.log('Reactions to remove:', reactionsToRemove);
          console.log('Reactions to add:', reactionsToAdd);

          // Remove outdated reactions first
          for (const reactionName of reactionsToRemove) {
            try {
              console.log(`Removing outdated reaction: ${reactionName}`);
              await slackApi('reactions.remove', {
                channel: SLACK_CHANNEL_ID,
                timestamp: slackTs,
                name: reactionName
              });
              await new Promise(resolve => setTimeout(resolve, 200));
            } catch (e) {
              if (e.message.includes('missing_scope')) {
                console.error(`ERROR: Slack bot missing permission to remove reactions. Please add 'reactions:write' scope to the Slack app.`);
                break;
              } else if (e.message.includes('no_reaction')) {
                console.log(`Reaction ${reactionName} was already removed`);
              } else {
                console.log(`Could not remove reaction ${reactionName}: ${e.message}`);
              }
            }
          }

          // Wait a bit after removals
          if (reactionsToRemove.length > 0) {
            await new Promise(resolve => setTimeout(resolve, 500));
          }

          // Add new reactions
          for (const reaction of reactionsToAdd) {
            try {
              console.log(`Adding reaction: ${reaction}`);
              await slackApi('reactions.add', {
                channel: SLACK_CHANNEL_ID,
                timestamp: slackTs,
                name: reaction
              });
              console.log(`Successfully added reaction: ${reaction}`);
              await new Promise(resolve => setTimeout(resolve, 200));
            } catch (e) {
              if (e.message.includes('missing_scope')) {
                console.error(`ERROR: Slack bot missing permission to add reactions. Please add 'reactions:write' scope to the Slack app.`);
                break;
              } else if (e.message.includes('already_reacted')) {
                console.log(`Reaction ${reaction} already exists (race condition)`);
              } else {
                console.log(`Could not add reaction ${reaction}: ${e.message}`);
              }
            }
          }
        }
      } catch (error) {
        console.error('Failed to process reactions:', error.message);
      }
    }

  } catch (error) {
    console.error('Failed to send Slack notification:', error);
    throw error;
  }
};