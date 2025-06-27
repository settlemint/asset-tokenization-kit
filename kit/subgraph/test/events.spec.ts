import { describe, expect, it } from 'bun:test';
import { theGraphClient, theGraphGraphql } from './utils/thegraph-client';

describe('Events', () => {
  it('should fetch a list of all events', async () => {
    const query = theGraphGraphql(
      `query {
        events(orderBy: blockNumber) {
          blockNumber
          eventName
          txIndex
          transactionHash
          involved {
            id
          }
        }
      }
    `
    );
    const response = await theGraphClient.request(query, {});
    expect(response.events.length).toBe(100);
  });

  it('should fetch a list of all events for a specific event name', async () => {
    const query = theGraphGraphql(
      `query($where: Event_filter) {
        events(where: $where, orderBy: blockNumber) {
          blockNumber
          eventName
        }
      }
    `
    );
    const response = await theGraphClient.request(query, {
      where: {
        eventName: 'TokenAssetCreated',
      },
    });
    expect(response.events.length).toBe(6);
  });
});
