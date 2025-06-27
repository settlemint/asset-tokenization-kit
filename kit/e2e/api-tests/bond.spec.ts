import { type APIRequestContext, expect, test } from '@playwright/test';

const AUTH_API_KEY: string | undefined = process.env.AUTH_API_KEY_FROM_SETUP;

test.describe('Bond API', () => {
  let request: APIRequestContext;

  test.beforeAll(async ({ playwright }) => {
    if (!AUTH_API_KEY) {
    }

    request = await playwright.request.newContext({
      extraHTTPHeaders: {
        'X-Api-Key': AUTH_API_KEY || '',
        'Content-Type': 'application/json',
      },
    });
  });

  test.afterAll(async () => {
    if (request) {
      await request.dispose();
    }
  });
  test('should fetch a list of all bonds', async () => {
    const endpoint = '/api/bond';

    await test.step(`GET ${endpoint} - Retrieve list of bonds`, async () => {
      const response = await request.get(endpoint);

      expect(response.status(), 'Response status should be 200').toBe(200);
      const responseBody = await response.json();

      expect(
        Array.isArray(responseBody),
        'Response body should be an array'
      ).toBe(true);

      if (responseBody.length > 0) {
        const firstBond = responseBody[0];
        expect(
          firstBond,
          'First item in the bond list should be an object'
        ).toBeInstanceOf(Object);
        expect(
          typeof firstBond.address,
          'First bond item should have an address string'
        ).toBe('string');
      }
    });
  });
});
