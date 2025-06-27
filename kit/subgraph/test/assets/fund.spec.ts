import { describe, expect, it } from 'bun:test';
import { theGraphClient, theGraphGraphql } from '../utils/thegraph-client';

describe('Funds', () => {
  it('should fetch a list of all funds', async () => {
    const query = theGraphGraphql(
      `query($where: Token_filter) {
        tokens(where: $where, orderBy: name) {
          name
          type
          fund {
            managementFeeBps
          }
        }
      }
    `
    );
    const response = await theGraphClient.request(query, {
      where: {
        fund_not: null,
      },
    });
    expect(response.tokens.length).toBe(1);
    expect(response.tokens).toEqual([
      {
        name: 'Bens Bugs',
        type: 'fund',
        fund: {
          managementFeeBps: 20,
        },
      },
    ]);
  });
});
