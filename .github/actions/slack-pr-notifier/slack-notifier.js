/**
 * Slack PR Notifier Script - Efficient Version
 * 
 * Key improvements:
 * - Delta-based updates: Only changes what's necessary
 * - Sanity checks: Verifies final state and recovers if needed
 * - Better error handling: slackTs is properly scoped
 * - Comprehensive debugging
 */

/**
 * Calculate the delta between two sets
 */
function calculateDelta(current, desired) {
  const currentSet = new Set(current);
  const desiredSet = new Set(desired);
  
  const toAdd = desired.filter(item => !currentSet.has(item));
  const toRemove = current.filter(item => !desiredSet.has(item));
  
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

  // Initialize slackTs at the top level to avoid reference errors
  let slackTs = null;

  try {
    // Check if repository is public
    const { data: repo } = await github.rest.repos.get({
      owner: context.repo.owner,
      repo: context.repo.repo
    });
    const isPrivateRepo = repo.private;
    console.log(`Repository is ${isPrivateRepo ? 'private' : 'public'}`);
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
      { label: 'qa:success', text: ':white_check_mark: QA Passed' },
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
      // For private repositories, use blocks instead of OpenGraph image
      if (isPrivateRepo) {
        messageBlocks = [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `${statusString}*<${PR_URL}|#${PR_NUMBER}: ${escapedTitle}>*\n_by ${PR_AUTHOR} • ${context.repo.owner}/${context.repo.repo}_`
            }
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
      } else {
        // Public repository - use OpenGraph image
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
            // Fallback to simpler text-only blocks
            let fallbackBlocks;
            
            if (isMerged || isAbandoned) {
              // For merged/abandoned, keep the simple format
              fallbackBlocks = messageBlocks;
            } else {
              // For active PRs, create a simplified block structure
              fallbackBlocks = [
                {
                  type: 'section',
                  text: {
                    type: 'mrkdwn',
                    text: `${statusString}*<${PR_URL}|#${PR_NUMBER}: ${escapedTitle}>*\n_by ${PR_AUTHOR}_`
                  }
                }
              ];
              
              // Add a simple button to view the PR
              fallbackBlocks.push({
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
                  }
                ]
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

    // EFFICIENT REACTION MANAGEMENT
    if (slackTs) {
      await manageReactionsEfficiently(slackTs, labels, slackApi, SLACK_CHANNEL_ID);
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
    console.error('Slack Timestamp:', slackTs || 'Not set');
    throw error;
  }

  console.log('\n=== SLACK NOTIFIER COMPLETED SUCCESSFULLY ===');
  console.log(`PR #${PR_NUMBER} processed`);
  console.log(`Slack timestamp: ${slackTs || 'New message created'}`);
};

/**
 * Efficiently manage reactions - only add/remove what's necessary
 */
async function manageReactionsEfficiently(slackTs, labels, slackApi, SLACK_CHANNEL_ID) {
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
    'status:mergeable': 'rocket'
    // Note: status:merged is intentionally not mapped - merged PRs should have no reactions
  };

  // Define mutually exclusive groups (only one can be active at a time)
  const exclusiveGroups = {
    'qa': ['hourglass_flowing_sand', 'runner', 'white_check_mark', 'x'],
    'status': ['eyes', 'thumbsup', 'rocket']
  };

  // All possible status reactions we manage
  const allStatusReactions = new Set(Object.values(statusReactions));

  try {
    // Get message to ensure it exists
    const messages = await slackApi('conversations.history', {
      channel: SLACK_CHANNEL_ID,
      latest: slackTs,
      limit: 1,
      inclusive: true
    });

    if (!messages.messages || messages.messages.length === 0) {
      console.warn('⚠️ No message found in Slack for timestamp:', slackTs);
      return;
    }

    const message = messages.messages[0];
    console.log('Message found for reaction management');

    // Get current reactions
    const currentReactions = (message.reactions || [])
      .filter(r => r.users && r.users.length > 0)
      .map(r => r.name);

    console.log(`Current reactions: [${currentReactions.join(', ')}]`);

    // Calculate desired reactions based on labels
    const desiredReactions = calculateDesiredReactions(labels, statusReactions, exclusiveGroups);
    
    console.log(`Desired reactions: [${desiredReactions.join(', ')}]`);

    // Calculate delta (what to add/remove) - only for reactions we manage
    const currentManagedReactions = currentReactions.filter(r => allStatusReactions.has(r));
    const delta = calculateDelta(currentManagedReactions, desiredReactions);

    console.log('\n=== EFFICIENT REACTION UPDATE PLAN ===');
    console.log(`Reactions to add: [${delta.add.join(', ')}]`);
    console.log(`Reactions to remove: [${delta.remove.join(', ')}]`);

    // Apply changes
    let changesMade = 0;
    const errors = [];

    // Remove reactions first
    for (const reaction of delta.remove) {
      try {
        console.log(`Removing reaction: ${reaction}`);
        await slackApi('reactions.remove', {
          channel: SLACK_CHANNEL_ID,
          timestamp: slackTs,
          name: reaction
        });
        changesMade++;
        await new Promise(resolve => setTimeout(resolve, 100)); // Small delay between operations
      } catch (error) {
        if (error.message.includes('no_reaction')) {
          console.log(`Reaction ${reaction} was already removed (race condition)`);
        } else {
          errors.push(`Failed to remove ${reaction}: ${error.message}`);
          console.error(`Failed to remove reaction ${reaction}:`, error.message);
        }
      }
    }

    // Add reactions
    for (const reaction of delta.add) {
      try {
        console.log(`Adding reaction: ${reaction}`);
        await slackApi('reactions.add', {
          channel: SLACK_CHANNEL_ID,
          timestamp: slackTs,
          name: reaction
        });
        changesMade++;
        await new Promise(resolve => setTimeout(resolve, 100)); // Small delay between operations
      } catch (error) {
        if (error.message.includes('already_reacted')) {
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
      await verifySanity(slackTs, desiredReactions, allStatusReactions, slackApi, SLACK_CHANNEL_ID);
    }

  } catch (error) {
    console.error('Failed to manage reactions:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

/**
 * Calculate desired reactions based on labels and rules
 */
function calculateDesiredReactions(labels, statusReactions, exclusiveGroups) {
  console.log('\n=== CALCULATING DESIRED REACTIONS ===');
  
  // Check if PR is merged - if so, we want NO reactions
  const isMerged = labels.some(l => l.name === 'status:merged');
  if (isMerged) {
    console.log('PR is merged - no reactions should be displayed');
    return [];
  }
  
  // Map labels to reactions
  const mappedReactions = [];
  for (const label of labels) {
    if (statusReactions[label.name]) {
      mappedReactions.push(statusReactions[label.name]);
      console.log(`Label "${label.name}" → reaction "${statusReactions[label.name]}"`);
    }
  }

  // Apply exclusive group rules
  const finalReactions = [];
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
        console.log(`Selected reaction "${selectedReaction}" for group "${groupName}"`);
        break;
      }
    }

    if (selectedReaction && mappedReactions.includes(selectedReaction)) {
      finalReactions.push(selectedReaction);
    }
  }

  // If QA is running or pending, only show QA reactions
  const hasQaInProgress = labels.some(l => l.name === 'qa:running' || l.name === 'qa:pending');
  if (hasQaInProgress) {
    console.log('QA in progress - filtering to only QA reactions');
    return finalReactions.filter(r => exclusiveGroups.qa.includes(r));
  }

  return finalReactions;
}

/**
 * Verify the final state matches our expectations
 */
async function verifySanity(slackTs, desiredReactions, allStatusReactions, slackApi, SLACK_CHANNEL_ID) {
  console.log('\n=== SANITY CHECK ===');
  
  // Wait a bit for Slack to process our changes
  await new Promise(resolve => setTimeout(resolve, 1000));

  try {
    // Re-fetch the message
    const messages = await slackApi('conversations.history', {
      channel: SLACK_CHANNEL_ID,
      latest: slackTs,
      limit: 1,
      inclusive: true
    });

    if (!messages.messages || messages.messages.length === 0) {
      console.error('❌ SANITY CHECK FAILED: Message disappeared!');
      return;
    }

    const message = messages.messages[0];
    const actualReactions = (message.reactions || [])
      .filter(r => r.users && r.users.length > 0)
      .map(r => r.name);

    // Get only managed reactions
    const actualManagedReactions = actualReactions.filter(r => allStatusReactions.has(r));

    // Compare
    const desiredArray = desiredReactions.sort();
    const actualArray = actualManagedReactions.sort();
    
    console.log(`Expected reactions: [${desiredArray.join(', ')}]`);
    console.log(`Actual reactions:   [${actualArray.join(', ')}]`);

    if (JSON.stringify(desiredArray) === JSON.stringify(actualArray)) {
      console.log('✅ SANITY CHECK PASSED: Reactions are correct');
    } else {
      console.error('❌ SANITY CHECK FAILED: Reactions mismatch!');
      
      // Calculate what's wrong
      const missing = desiredArray.filter(r => !actualArray.includes(r));
      const extra = actualArray.filter(r => !desiredArray.includes(r));
      
      if (missing.length > 0) {
        console.error(`Missing reactions: [${missing.join(', ')}]`);
      }
      if (extra.length > 0) {
        console.error(`Extra reactions: [${extra.join(', ')}]`);
      }

      // Attempt recovery
      console.log('\n🔧 ATTEMPTING FULL RESET...');
      
      // Remove all managed reactions
      for (const reaction of actualManagedReactions) {
        try {
          await slackApi('reactions.remove', {
            channel: SLACK_CHANNEL_ID,
            timestamp: slackTs,
            name: reaction
          });
          await new Promise(resolve => setTimeout(resolve, 200));
        } catch (e) {
          console.error(`Failed to remove ${reaction} during reset:`, e.message);
        }
      }

      // Add all desired reactions
      for (const reaction of desiredReactions) {
        try {
          await slackApi('reactions.add', {
            channel: SLACK_CHANNEL_ID,
            timestamp: slackTs,
            name: reaction
          });
          await new Promise(resolve => setTimeout(resolve, 200));
        } catch (e) {
          console.error(`Failed to add ${reaction} during reset:`, e.message);
        }
      }

      console.log('Full reset completed');
    }

  } catch (error) {
    console.error('Failed to perform sanity check:', error.message);
  }
}