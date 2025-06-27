import { describe, expect, it } from 'bun:test';
import { theGraphClient, theGraphGraphql } from '../utils/thegraph-client';

describe('Push Airdrops', () => {
  it('should fetch a list of all push airdrops', async () => {
    const query = theGraphGraphql(
      `query($where: Airdrop_filter) {
        airdrops(where: $where, orderBy: name) {
          name
          token {
            name
          }
          pushAirdrop {
            distributionCap
            distributionCapExact
          }
        }
      }`
    );
    const response = await theGraphClient.request(query, {
      where: {
        pushAirdrop_not: null,
      },
    });

    expect(response.airdrops.length).toBe(1);
    expect(response.airdrops).toEqual([
      {
        name: 'Test Push Airdrop',
        token: {
          name: expect.any(String),
        },
        pushAirdrop: {
          distributionCap: expect.any(String),
          distributionCapExact: expect.any(String),
        },
      },
    ]);
  });

  it('should fetch push airdrop with distribution cap details', async () => {
    const query = theGraphGraphql(
      `query($where: Airdrop_filter) {
        airdrops(where: $where, orderBy: name) {
          name
          amountTransferred
          amountTransferredExact
          pushAirdrop {
            distributionCap
            distributionCapExact
          }
        }
      }`
    );
    const response = await theGraphClient.request(query, {
      where: {
        pushAirdrop_not: null,
      },
    });
    expect(response.airdrops.length).toBe(1);
    expect(response.airdrops).toEqual([
      {
        name: 'Test Push Airdrop',
        amountTransferred: expect.any(String),
        amountTransferredExact: expect.any(String),
        pushAirdrop: {
          distributionCap: expect.any(String),
          distributionCapExact: expect.any(String),
        },
      },
    ]);
  });
});
