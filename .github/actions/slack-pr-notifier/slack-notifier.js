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

      // Define reaction mappings
      const reactionMappings = {
        // Status reactions
        'draft': ':pencil2:',
        'ready-for-review': ':mag:',
        'in-review': ':eyes:',
        'qa:running': ':hourglass_flowing_sand:',
        'qa:failed': ':x:',
        'qa:passed': ':white_check_mark:',
        'changes-requested': ':warning:',
        'approved': ':white_check_mark:',
        'on-hold': ':pause_button:',
        'blocked': ':octagonal_sign:',
        'ready-to-merge': ':rocket:',
        'merged': ':tada:',
        // Priority reactions
        'priority:critical': ':rotating_light:',
        'priority:high': ':arrow_up:',
        'priority:medium': ':arrow_right:',
        'priority:low': ':arrow_down:',
        // Type reactions
        'type:bug': ':bug:',
        'type:feature': ':sparkles:',
        'type:refactor': ':recycle:',
        'type:test': ':test_tube:',
        'type:docs': ':books:',
        'type:chore': ':wrench:',
        'type:style': ':art:',
        'type:perf': ':zap:',
        'type:security': ':shield:',
        'type:breaking': ':boom:'
      };

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
          
          // Get current reactions
          const reactionsResponse = await slackApi('reactions.get', {
            channel: SLACK_CHANNEL_ID,
            timestamp: slackTs
          });

          const existingReactions = (reactionsResponse.message.reactions || [])
            .map(r => r.name);
            
          console.log('Existing reactions:', existingReactions);

          // Process each reaction mapping
          for (const [labelName, emoji] of Object.entries(reactionMappings)) {
            const hasLabel = labels.some(lbl => 
              lbl.name === labelName || lbl.name === `status:${labelName}`
            );
            const reactionName = emoji.replace(/:/g, '');
            const hasReaction = existingReactions.includes(reactionName);

            if (hasLabel && !hasReaction) {
              // Add reaction
              console.log(`Adding reaction ${emoji} for label ${labelName}`);
              try {
                await slackApi('reactions.add', {
                  channel: SLACK_CHANNEL_ID,
                  timestamp: slackTs,
                  name: reactionName
                });
              } catch (err) {
                console.error(`Failed to add reaction ${emoji}:`, err.message);
              }
            } else if (!hasLabel && hasReaction) {
              // Remove reaction
              console.log(`Removing reaction ${emoji} for label ${labelName}`);
              try {
                await slackApi('reactions.remove', {
                  channel: SLACK_CHANNEL_ID,
                  timestamp: slackTs,
                  name: reactionName
                });
              } catch (err) {
                console.error(`Failed to remove reaction ${emoji}:`, err.message);
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