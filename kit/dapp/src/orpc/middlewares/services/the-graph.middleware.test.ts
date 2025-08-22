/**
 * @vitest-environment node
 *
 * @module TheGraphMiddlewareTest
 * @description Comprehensive test suite for TheGraph middleware
 *
 * @overview
 * This test suite comprehensively validates the behavior of the TheGraph middleware
 * by testing various GraphQL querying scenarios, focusing on:
 * - Automatic pagination
 * - Complex query handling
 * - Error management
 * - Data merging strategies
 *
 * @testCoverage
 * - ✅ Real-world token list queries
 * - ✅ Error scenario simulations
 * - ✅ Variable and query manipulation
 *
 * @keyFeatures
 * - GraphQL variable management
 * - Zod schema validation
 * - Robust error handling
 *
 * @testEnvironment Node.js (server-side rendering)
 *
 * @see TheGraphMiddleware
 */

import type { TadaDocumentNode } from "gql.tada";
import { parse, print } from "graphql";
import { ClientError } from "graphql-request";
import { beforeEach, describe, expect, test, vi, type Mock } from "vitest";
import { z } from "zod";

// Import from the mocked module - vitest config alias handles this
import { theGraphClient } from "@/lib/settlemint/the-graph";

// Import the middleware
import {
  theGraphMiddleware,
  type ValidatedTheGraphClient,
} from "./the-graph.middleware";

// Note: This test runs in Node environment (@vitest-environment node)
// to avoid browser environment checks in the SDK

// Note: theGraphClient is mocked via vitest config alias

// Helper to create a mock GraphQL document
/**
 * Creates a mock GraphQL document node for testing purposes
 *
 * @param {string} query - GraphQL query string to parse
 * @returns {TadaDocumentNode<unknown, unknown>} Parsed document node for testing
 *
 * @description
 * Converts a GraphQL query string into a DocumentNode for use in tests
 * Useful for creating test scenarios without full schema definitions
 *
 * @example
 * const query = createMockDocument(`
 *   query TestQuery {
 *     tokens {
 *       id
 *       name
 *     }
 *   }
 * `);
 *
 * @category TestHelpers
 */
function createMockDocument(query: string): TadaDocumentNode<unknown, unknown> {
  return parse(query) as unknown as TadaDocumentNode<unknown, unknown>;
}

describe("the-graph.middleware", () => {
  let mockContext: Record<string, unknown>;
  let mockNext: ReturnType<typeof vi.fn>;
  let mockErrors: Record<string, ReturnType<typeof vi.fn>>;

  // Test browser environment mock
  test("browser environment should be properly mocked", () => {
    // Verify window is undefined for Node.js test environment
    expect(globalThis.window).toBeUndefined();

    // If we want to test with window defined but without document
    Object.defineProperty(globalThis, "window", {
      value: { someOtherProp: true },
      writable: true,
      configurable: true,
    });
    expect(globalThis.window?.document).toBeUndefined();

    // Clean up for other tests
    Object.defineProperty(globalThis, "window", {
      value: undefined,
      writable: true,
      configurable: true,
    });
  });

  beforeEach(() => {
    vi.clearAllMocks();

    // Reset the theGraphClient mock
    const mockRequest = theGraphClient.request as Mock;
    if (mockRequest.mockReset) {
      mockRequest.mockReset();
    }
    (theGraphClient.request as Mock) = vi.fn();

    // Create mock errors object
    mockErrors = {
      THE_GRAPH_ERROR: vi.fn((params) => {
        const error = new Error(params.message || "TheGraph Error");
        Object.assign(error, {
          code: "THE_GRAPH_ERROR",
          data: params.data,
          cause: params.cause,
        });
        return error;
      }),
    };

    // Create mock next function
    mockNext = vi.fn((params) => ({
      context: params.context,
    }));

    // Create base context
    mockContext = {};
  });

  describe("middleware initialization", () => {
    test("should create a new client when context doesn't have one", async () => {
      // ORPC middleware is created using baseRouter.middleware() and returns a handler function
      // The middleware needs to be invoked properly with the correct signature
      const middlewareHandler = theGraphMiddleware as unknown as (options: {
        context: Record<string, unknown>;
        next: (options: { context: Record<string, unknown> }) => unknown;
        errors: typeof mockErrors;
      }) => Promise<unknown>;

      const result = await middlewareHandler({
        context: mockContext,
        next: mockNext,
        errors: mockErrors,
      });

      expect(mockNext).toHaveBeenCalledOnce();
      expect(mockNext).toHaveBeenCalledWith({
        context: {
          theGraphClient: expect.objectContaining({
            query: expect.any(Function),
          }),
        },
      });

      // Verify the middleware returns the result from next()
      expect(result).toBeDefined();
    });

    test("should reuse existing client when context already has one", async () => {
      const existingClient = { query: vi.fn() };
      mockContext.theGraphClient = existingClient;

      const result = await (
        theGraphMiddleware as unknown as (options: {
          context: Record<string, unknown>;
          next: (options: { context: Record<string, unknown> }) => unknown;
          errors: typeof mockErrors;
        }) => Promise<unknown>
      )({
        context: mockContext,
        next: mockNext,
        errors: mockErrors,
      });

      expect(mockNext).toHaveBeenCalledWith({
        context: {
          theGraphClient: existingClient,
        },
      });

      // Verify the middleware returns the result from next()
      expect(result).toBeDefined();
    });
  });

  describe("query execution", () => {
    let client: ValidatedTheGraphClient;

    beforeEach(async () => {
      // Get the client instance from the middleware
      const middleware = theGraphMiddleware as unknown as (options: {
        context: Record<string, unknown>;
        next: (options: { context: Record<string, unknown> }) => unknown;
        errors: typeof mockErrors;
      }) => Promise<void>;
      await middleware({
        context: mockContext,
        next: (params: { context: Record<string, unknown> }) => {
          client = params?.context?.theGraphClient as ValidatedTheGraphClient;
          return mockNext(params || { context: {} });
        },
        errors: mockErrors,
      });
    });

    describe("non-list queries", () => {
      test("should pass through queries without list fields", async () => {
        const SINGLE_ENTITY_QUERY = createMockDocument(`
          query SingleEntity($id: ID!) {
            token(id: $id) {
              id
              name
              symbol
            }
          }
        `);

        const mockResponse = {
          token: {
            id: "0x123",
            name: "Single Token",
            symbol: "STK",
          },
        };

        (theGraphClient.request as Mock).mockResolvedValueOnce(mockResponse);

        const schema = z.object({
          token: z.object({
            id: z.string(),
            name: z.string(),
            symbol: z.string(),
          }),
        });

        const result = await client.query(SINGLE_ENTITY_QUERY, {
          input: { id: "0x123" },
          output: schema,
        });

        expect(result.token.name).toBe("Single Token");
        expect(theGraphClient.request).toHaveBeenCalledOnce();
      });
    });

    describe("real token list query", () => {
      const REAL_TOKEN_QUERY = createMockDocument(`
        query ListTokenQuery($skip: Int!, $first: Int!, $orderBy: Token_orderBy, $orderDirection: OrderDirection, $where: Token_filter) {
          tokens(
            where: $where
            skip: $skip
            first: $first
            orderBy: $orderBy
            orderDirection: $orderDirection
          ) {
            id
            type
            createdAt
            name
            symbol
            decimals
            totalSupply
            pausable {
              paused
            }
          }
        }
      `);

      const TokensResponseSchema = z.object({
        tokens: z.array(
          z.object({
            id: z.string(),
            type: z.string(),
            createdAt: z.string(),
            name: z.string(),
            symbol: z.string(),
            decimals: z.number(),
            totalSupply: z.string(),
            pausable: z.object({
              paused: z.boolean(),
            }),
          })
        ),
      });

      test("should handle exact token.list.ts query with searchByAddress", async () => {
        const searchAddress = "0xABCDEF1234567890123456789012345678901234";

        // Mock response matching the exact schema from token.list.ts
        const mockTokenResponse = {
          id: searchAddress.toLowerCase(),
          type: "ERC20",
          createdAt: "1700000000",
          name: "Test Token",
          symbol: "TEST",
          decimals: 18,
          totalSupply: "1000000000000000000000000",
          pausable: {
            paused: false,
          },
        };

        (theGraphClient.request as Mock).mockResolvedValueOnce({
          tokens: [mockTokenResponse],
        });

        const result = await client.query(REAL_TOKEN_QUERY, {
          input: {
            where: {
              id: searchAddress.toLowerCase(), // searchByAddress is mapped to id in token.list.ts
            },
          },
          output: TokensResponseSchema,
        });

        expect(result.tokens).toHaveLength(1);
        expect(result.tokens[0]?.id).toBe(searchAddress.toLowerCase());
        expect(result.tokens[0]?.name).toBe("Test Token");
        expect(result.tokens[0]?.symbol).toBe("TEST");
        expect(result.tokens[0]?.pausable.paused).toBe(false);

        // Verify the query was called with correct where clause
        const callArgs = (theGraphClient.request as Mock).mock.calls[0];
        expect(callArgs?.[1]).toEqual({
          where: {
            id: searchAddress.toLowerCase(),
          },
        });
      });
    });

    describe("nested list fields", () => {
      test("should handle tokens with nested balances list", async () => {
        const NESTED_QUERY = createMockDocument(`
          query TokensWithBalances {
            tokens(first: 100) {
              id
              name
              balances(first: 100) {
                id
                account {
                  id
                }
                value
              }
            }
          }
        `);

        const mockResponse = {
          tokens: [
            {
              id: "0x111",
              name: "Token 1",
              balances: Array.from({ length: 50 }, (_, i) => ({
                id: `balance-${i}`,
                account: { id: `account-${i}` },
                value: "1000000",
              })),
            },
            {
              id: "0x222",
              name: "Token 2",
              balances: Array.from({ length: 30 }, (_, i) => ({
                id: `balance-2-${i}`,
                account: { id: `account-2-${i}` },
                value: "2000000",
              })),
            },
          ],
        };

        (theGraphClient.request as Mock).mockResolvedValueOnce(mockResponse);

        const schema = z.object({
          tokens: z.array(
            z.object({
              id: z.string(),
              name: z.string(),
              balances: z.array(
                z.object({
                  id: z.string(),
                  account: z.object({ id: z.string() }),
                  value: z.string(),
                })
              ),
            })
          ),
        });

        const result = await client.query(NESTED_QUERY, {
          input: {},
          output: schema,
        });

        expect(result.tokens).toHaveLength(2);
        expect(result.tokens[0]?.balances).toHaveLength(50);
        expect(result.tokens[1]?.balances).toHaveLength(30);
      });
    });

    describe("error handling", () => {
      test("should handle ClientError with GraphQL errors", async () => {
        const graphQLErrors = [
          { message: "Field 'invalid' not found" },
          { message: "Permission denied" },
        ];

        const clientError = new ClientError(
          {
            data: null,
            errors: graphQLErrors,
          } as never,
          { query: "query { invalid }" } as never
        );

        (theGraphClient.request as Mock).mockRejectedValueOnce(clientError);

        const SIMPLE_QUERY = createMockDocument(`
          query SimpleQuery {
            tokens {
              id
            }
          }
        `);

        await expect(
          client.query(SIMPLE_QUERY, {
            input: {},
            output: z.object({ tokens: z.array(z.object({ id: z.string() })) }),
          })
        ).rejects.toThrow();

        expect(mockErrors.THE_GRAPH_ERROR).toHaveBeenCalledWith({
          message: "Field 'invalid' not found, Permission denied",
          data: expect.objectContaining({
            document: print(SIMPLE_QUERY),
            variables: {},
          }),
          cause: clientError,
        });
      });

      test("should handle ZodError when response doesn't match schema", async () => {
        (theGraphClient.request as Mock)
          .mockResolvedValueOnce({
            tokens: [
              {
                id: "0x123",
                name: "Token",
                // Missing required 'symbol' field
              },
            ],
          })
          .mockResolvedValueOnce({}); // Empty response for non-list fields

        const TYPED_QUERY = createMockDocument(`
          query TypedQuery {
            tokens {
              id
              name
              symbol
            }
          }
        `);

        const strictSchema = z.object({
          tokens: z.array(
            z.object({
              id: z.string(),
              name: z.string(),
              symbol: z.string(), // Required field
            })
          ),
        });

        await expect(
          client.query(TYPED_QUERY, {
            input: {},
            output: strictSchema,
          })
        ).rejects.toThrow();

        expect(mockErrors.THE_GRAPH_ERROR).toHaveBeenCalledWith(
          expect.objectContaining({
            message: expect.any(String),
            data: expect.objectContaining({
              responseValidation: expect.any(String),
            }),
            cause: expect.any(z.ZodError),
          })
        );
      });

      test("should handle generic errors", async () => {
        const genericError = new Error("Network timeout");
        (theGraphClient.request as Mock).mockReset();
        (theGraphClient.request as Mock).mockRejectedValueOnce(genericError);

        const QUERY = createMockDocument(`query { tokens { id } }`);

        await expect(
          client.query(QUERY, {
            input: {},
            output: z.object({ tokens: z.array(z.object({ id: z.string() })) }),
          })
        ).rejects.toThrow();

        expect(mockErrors.THE_GRAPH_ERROR).toHaveBeenCalledWith({
          message: "Network timeout",
          data: expect.any(Object),
          cause: genericError,
        });
      });
    });

    describe("edge cases", () => {
      test("should handle null list field", async () => {
        (theGraphClient.request as Mock).mockReset();
        (theGraphClient.request as Mock).mockResolvedValueOnce({
          tokens: null,
          meta: { version: "1.0" },
        });

        const NULL_FIELD_QUERY = createMockDocument(`
          query NullFieldQuery {
            tokens {
              id
            }
            meta {
              version
            }
          }
        `);

        const result = await client.query(NULL_FIELD_QUERY, {
          input: {},
          output: z.object({
            tokens: z.array(z.object({ id: z.string() })).nullable(),
            meta: z.object({ version: z.string() }),
          }),
        });

        expect(result.tokens).toBeNull();
        expect(result.meta.version).toBe("1.0");
        expect(theGraphClient.request).toHaveBeenCalledTimes(1);
      });

      test("should handle query with aliases", async () => {
        const ALIAS_QUERY = createMockDocument(`
          query AliasQuery {
            allTokens: tokens(first: 100) {
              tokenId: id
              tokenName: name
            }
          }
        `);

        (theGraphClient.request as Mock).mockReset();
        (theGraphClient.request as Mock).mockResolvedValueOnce({
          allTokens: [
            { tokenId: "0x123", tokenName: "Token 1" },
            { tokenId: "0x456", tokenName: "Token 2" },
          ],
        }); // Only list field response, no non-list fields

        const result = await client.query(ALIAS_QUERY, {
          input: {},
          output: z.object({
            allTokens: z.array(
              z.object({
                tokenId: z.string(),
                tokenName: z.string(),
              })
            ),
          }),
        });

        expect(result.allTokens).toHaveLength(2);
        expect(result.allTokens[0]?.tokenId).toBe("0x123");
        expect(theGraphClient.request).toHaveBeenCalledTimes(1); // Only one call for list field
      });

      test("should handle query with variables", async () => {
        const VARIABLE_QUERY = createMockDocument(`
          query VariableQuery($tokenType: String!, $minSupply: BigInt!) {
            tokens(where: { type: $tokenType, totalSupply_gte: $minSupply }) {
              id
              type
              totalSupply
            }
          }
        `);

        (theGraphClient.request as Mock).mockReset();
        (theGraphClient.request as Mock).mockResolvedValueOnce({
          tokens: [
            {
              id: "0x111",
              type: "ERC20",
              totalSupply: "2000000",
            },
          ],
        }); // Only list field response

        const result = await client.query(VARIABLE_QUERY, {
          input: {
            tokenType: "ERC20",
            minSupply: "1000000",
          },
          output: z.object({
            tokens: z.array(
              z.object({
                id: z.string(),
                type: z.string(),
                totalSupply: z.string(),
              })
            ),
          }),
        });

        expect(result.tokens).toHaveLength(1);
        expect(result.tokens[0]?.type).toBe("ERC20");
        expect(theGraphClient.request).toHaveBeenCalledTimes(1); // Only one call
      });
    });

    describe("context passing", () => {
      test("middleware should pass context correctly", async () => {
        const customContext = {
          user: { id: "123", name: "Test User" },
          customData: "test",
        };

        const middlewareHandler = theGraphMiddleware as unknown as (options: {
          context: Record<string, unknown>;
          next: (options: { context: Record<string, unknown> }) => unknown;
          errors: typeof mockErrors;
        }) => Promise<unknown>;

        let capturedContext: Record<string, unknown> | undefined;
        const customNext = vi.fn(
          (params: { context: Record<string, unknown> }) => {
            capturedContext = params?.context;
            return { context: params?.context };
          }
        );

        await middlewareHandler({
          context: customContext,
          next: customNext,
          errors: mockErrors,
        });

        expect(customNext).toHaveBeenCalledOnce();
        expect(capturedContext).toBeDefined();
        expect(capturedContext?.theGraphClient).toBeDefined();
        expect(
          (capturedContext?.theGraphClient as Record<string, unknown>)?.query
        ).toBeInstanceOf(Function);
        // The middleware only passes theGraphClient in the context
        // It doesn't merge with the original context
        expect(capturedContext?.user).toBeUndefined();
        expect(capturedContext?.customData).toBeUndefined();
      });
    });
  });
});
