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
    let { data: labels } = await github.rest.issues.listLabelsOnIssue({
      owner: context.repo.owner,
      repo: context.repo.repo,
      issue_number: PR_NUMBER
    });
    
    // Ensure labels is always an array
    if (!Array.isArray(labels)) {
      console.error('WARNING: Labels response is not an array:', labels);
      labels = [];
    }
    
    console.log(`Found ${labels.length} PR labels:`, labels.map(l => l.name));

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

    // Check if PR is from a bot - SKIP ALL BOT PRS
    if (PR_AUTHOR_TYPE === 'Bot') {
      console.log(`Skipping notification for bot PR from ${PR_AUTHOR}`);
      return;
    }

    // Check if PR is draft
    const isDraft = Array.isArray(labels) && labels.some(label => label.name === 'status:draft');
    if (isDraft) {
      console.log('Skipping notification for draft PR');
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

    // Slack API helper with enhanced debugging
    async function slackApi(method, params) {
      const startTime = Date.now();
      console.log(`[${new Date().toISOString()}] Calling Slack API: ${method}`);
      console.log('Request params:', JSON.stringify(params, null, 2));
      
      try {
        const response = await fetch(`https://slack.com/api/${method}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${SLACK_BOT_TOKEN}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(params)
        });
        
        const data = await response.json();
        const duration = Date.now() - startTime;
        
        if (data.ok) {
          console.log(`✓ Slack API ${method} succeeded in ${duration}ms`);
          // Log specific useful response data
          if (method === 'conversations.history' && data.messages) {
            console.log(`  Found ${data.messages.length} messages`);
          }
          if (method === 'chat.postMessage' && data.ts) {
            console.log(`  Message posted with timestamp: ${data.ts}`);
          }
        } else {
          console.error(`✗ Slack API ${method} failed in ${duration}ms:`, data.error);
          if (data.error === 'missing_scope') {
            console.error(`  Required scope for ${method}: Check Slack app permissions`);
          }
          if (data.error === 'not_in_channel') {
            console.error(`  Bot is not in channel ${SLACK_CHANNEL_ID}`);
          }
          if (data.error === 'channel_not_found') {
            console.error(`  Channel ${SLACK_CHANNEL_ID} not found`);
          }
          if (data.error === 'rate_limited') {
            console.error(`  Rate limited. Retry after: ${data.retry_after} seconds`);
          }
        }
        
        if (!data.ok) {
          throw new Error(`Slack API error: ${data.error}`);
        }
        return data;
      } catch (error) {
        const duration = Date.now() - startTime;
        console.error(`✗ Slack API ${method} failed with exception in ${duration}ms:`, error.message);
        throw error;
      }
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
          console.log('Message details:', {
            ts: message.ts,
            text: message.text,
            reactions: message.reactions
          });
          
          const existingReactions = (message.reactions || [])
            .filter(r => r.users && r.users.length > 0) // Only reactions that have users
            .map(r => r.name);
            
          console.log(`Found ${existingReactions.length} existing reactions:`, existingReactions);
          
          // Debug: Show all available labels and their potential reactions
          console.log('\n=== REACTION MAPPING DEBUG ===');
          console.log('Available status reactions:', statusReactions);
          console.log('Current PR labels:', labels.map(l => l.name));
          console.log('Labels that map to reactions:');
          for (const label of labels) {
            if (statusReactions[label.name]) {
              console.log(`  "${label.name}" → "${statusReactions[label.name]}"`);
            }
          }

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
          console.log('\n=== EXCLUSIVE GROUPS PROCESSING ===');
          const finalStatuses = [];
          const usedGroups = new Set();

          // Priority order for exclusive groups
          const groupPriority = {
            'qa': ['qa:failed', 'qa:success', 'qa:running', 'qa:pending'],
            'status': ['status:merged', 'status:mergeable', 'status:approved', 'status:ready-for-review']
          };

          console.log('Exclusive groups:', exclusiveGroups);
          console.log('Group priorities:', groupPriority);

          // For each group, pick only the highest priority reaction
          for (const [groupName, groupReactions] of Object.entries(exclusiveGroups)) {
            const priorityOrder = groupPriority[groupName] || [];
            console.log(`\nProcessing group "${groupName}" with priorities:`, priorityOrder);

            // Find the highest priority label from this group
            let selectedReaction = null;
            for (const priorityLabel of priorityOrder) {
              const hasLabel = labels.some(l => l.name === priorityLabel);
              const hasMappedReaction = statusReactions[priorityLabel];
              console.log(`  Checking "${priorityLabel}": hasLabel=${hasLabel}, hasMappedReaction=${!!hasMappedReaction}`);
              
              if (hasLabel && hasMappedReaction) {
                selectedReaction = statusReactions[priorityLabel];
                console.log(`  ✓ Selected reaction "${selectedReaction}" for group "${groupName}"`);
                break;
              }
            }

            if (selectedReaction && currentStatuses.includes(selectedReaction)) {
              finalStatuses.push(selectedReaction);
              usedGroups.add(groupName);
              console.log(`  Added "${selectedReaction}" to final statuses`);
            } else if (selectedReaction) {
              console.log(`  ✗ Reaction "${selectedReaction}" not in current statuses`);
            } else {
              console.log(`  No reaction selected for group "${groupName}"`);
            }
          }

          // If QA is running or pending, don't show status reactions
          const hasQaInProgress = labels.some(l => l.name === 'qa:running' || l.name === 'qa:pending');
          console.log(`\nQA in progress: ${hasQaInProgress}`);
          
          const filteredStatuses = hasQaInProgress
            ? finalStatuses.filter(r => exclusiveGroups.qa.includes(r))
            : finalStatuses;

          console.log('\n=== FINAL REACTION DECISIONS ===');
          console.log('Current statuses from labels:', currentStatuses);
          console.log('Final statuses after exclusive groups:', finalStatuses);
          console.log('Filtered statuses (after QA check):', filteredStatuses);
          console.log('Used exclusive groups:', Array.from(usedGroups));

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

          console.log('\n=== REACTION SYNC PLAN ===');
          console.log(`Existing reactions on message: [${existingReactions.join(', ')}]`);
          console.log(`Reactions to remove: [${reactionsToRemove.join(', ')}]`);
          console.log(`Reactions to add: [${reactionsToAdd.join(', ')}]`);
          console.log(`Is merged PR: ${isMerged}`);

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
        } else {
          console.warn('⚠️ No message found in Slack for timestamp:', slackTs);
          console.warn('This could mean:');
          console.warn('  1. The message was deleted');
          console.warn('  2. The bot lost access to the channel');
          console.warn('  3. The timestamp is invalid');
          console.warn('  4. The message is in a different channel');
        }
      } catch (error) {
        console.error('Failed to process reactions:', error.message);
        console.error('Stack trace:', error.stack);
        
        // Log specific error types
        if (error.message.includes('not_in_channel')) {
          console.error('⚠️ Bot is not in the channel. Please invite the bot to the channel.');
        }
        if (error.message.includes('channel_not_found')) {
          console.error('⚠️ Channel not found. Check SLACK_CHANNEL_ID is correct.');
        }
        if (error.message.includes('invalid_auth')) {
          console.error('⚠️ Invalid authentication. Check SLACK_BOT_TOKEN.');
        }
      }
    }

  } catch (error) {
    console.error('❌ CRITICAL ERROR in Slack notifier:', error.message);
    console.error('Stack trace:', error.stack);
    console.error('\n=== EXECUTION CONTEXT ===');
    console.error('PR Number:', PR_NUMBER);
    console.error('PR Title:', PR_TITLE);
    console.error('PR Author:', PR_AUTHOR);
    console.error('Author Type:', PR_AUTHOR_TYPE);
    console.error('Channel ID:', SLACK_CHANNEL_ID ? 'Set' : 'Not set');
    console.error('Bot Token:', SLACK_BOT_TOKEN ? 'Set' : 'Not set');
    throw error;
  }

  console.log('\n=== SLACK NOTIFIER COMPLETED SUCCESSFULLY ===');
  console.log(`PR #${PR_NUMBER} processed`);
  console.log(`Slack timestamp: ${slackTs || 'New message created'}`);
};