import { describe, expect, it } from 'bun:test';
import { theGraphClient, theGraphGraphql } from '../utils/thegraph-client';

describe('Token pausable extension', () => {
  it('tokens can be pausable', async () => {
    const query = theGraphGraphql(
      `query($where: Token_filter) {
        tokens(where: $where, orderBy: name) {
          name
          type
          pausable {
            paused
          }
        }
      }
    `
    );
    const response = await theGraphClient.request(query, {
      where: {
        pausable_not: null,
      },
    });
    expect(response.tokens.length).toBe(6);
    expect(response.tokens).toEqual([
      { name: 'Apple', type: 'equity', pausable: { paused: false } },
      { name: 'Bens Bugs', type: 'fund', pausable: { paused: false } },
      { name: 'Euro Bonds', type: 'bond', pausable: { paused: false } },
      { name: 'Euro Deposits', type: 'deposit', pausable: { paused: false } },
      {
        name: 'Paused Stablecoin',
        type: 'stablecoin',
        pausable: { paused: true },
      },
      { name: 'Tether', type: 'stablecoin', pausable: { paused: false } },
    ]);
  });
});
