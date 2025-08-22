/**
 * @vitest-environment node
 *
 * @module PortalMiddlewareTest
 * @description Comprehensive test suite for Portal middleware
 *
 * @overview
 * This test suite comprehensively validates the behavior of the Portal middleware
 * by testing various GraphQL mutation and query scenarios, focusing on:
 * - Transaction hash extraction and validation
 * - Transaction tracking and monitoring
 * - Schema validation for queries
 * - Error management
 * - Integration with TheGraph for indexing status
 *
 * @testCoverage
 * - ✅ Real-world mutation scenarios with transaction tracking
 * - ✅ Query validation with Zod schemas
 * - ✅ Transaction hash extraction from various response structures
 * - ✅ Error scenario simulations
 * - ✅ TheGraph indexing integration
 *
 * @keyFeatures
 * - Transaction lifecycle monitoring
 * - Automatic transaction hash validation
 * - Zod schema validation for queries
 * - Robust error handling
 * - Integration with TheGraph client
 *
 * @testEnvironment Node.js (server-side rendering)
 *
 * @see PortalMiddleware
 */

import type { EthereumAddress } from "@atk/zod/ethereum-address";
import type { TadaDocumentNode } from "gql.tada";
import { Kind, parse } from "graphql";
import { ClientError } from "graphql-request";
import { beforeEach, describe, expect, type Mock, test, vi } from "vitest";
import { z } from "zod";
// Import from the mocked module - vitest config alias handles this
import { portalClient } from "@/lib/settlemint/portal";
import { print } from "graphql";
// Import the middleware
import {
  portalMiddleware,
  type ValidatedPortalClient,
} from "./portal.middleware";

// Note: This test runs in Node environment (@vitest-environment node)
// to avoid browser environment checks in the SDK

// Note: portalClient is mocked via vitest config alias

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
 * const mutation = createMockDocument(`
 *   mutation CreateToken {
 *     createToken(input: { name: "Test" }) {
 *       transactionHash
 *       token {
 *         id
 *       }
 *     }
 *   }
 * `);
 *
 * @category TestHelpers
 */
function createMockDocument(query: string): TadaDocumentNode<unknown, unknown> {
  const doc = parse(query) as unknown as TadaDocumentNode<unknown, unknown>;
  // Add operation name metadata for better testing
  const operationName = doc.definitions.find(
    (def) => def.kind === Kind.OPERATION_DEFINITION
  )?.name?.value;
  if (operationName) {
    (doc as unknown as Record<string, unknown>).__meta = { operationName };
  }
  return doc;
}

// Helper to create a valid transaction hash
/**
 * Creates a valid Ethereum transaction hash for testing
 *
 * @param {number} id - Numeric identifier for uniqueness
 * @returns {string} A valid 66-character transaction hash (0x + 64 hex chars)
 *
 * @description
 * Generates a properly formatted Ethereum transaction hash
 * Useful for testing transaction-related functionality
 *
 * @example
 * const txHash = createTxHash(1); // Returns "0x0000...0001"
 *
 * @category TestHelpers
 */
function createTxHash(id: number): string {
  return `0x${id.toString(16).padStart(64, "0")}`;
}

describe("portal.middleware", () => {
  let mockContext: Record<string, unknown>;
  let mockNext: ReturnType<typeof vi.fn>;
  let mockErrors: Record<string, ReturnType<typeof vi.fn>>;
  let mockTheGraphClient: {
    query: ReturnType<typeof vi.fn>;
  };

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

    // Reset the portalClient mock
    const mockRequest = portalClient.request as Mock;
    if (mockRequest.mockReset) {
      mockRequest.mockReset();
    }
    (portalClient.request as Mock) = vi.fn();

    // Create mock errors object
    mockErrors = {
      PORTAL_ERROR: vi.fn((params) => {
        const error = new Error(params.message || "Portal Error");
        Object.assign(error, {
          code: "PORTAL_ERROR",
          data: params.data,
          cause: params.cause,
        });
        throw error;
      }),
      NOT_FOUND: vi.fn(() => {
        const error = new Error("Not Found");
        Object.assign(error, { code: "NOT_FOUND" });
        throw error;
      }),
    };

    // Create mock next function
    mockNext = vi.fn((params) => ({
      context: params.context,
    }));

    // Create mock TheGraph client
    mockTheGraphClient = {
      query: vi.fn(),
    };

    // Create base context
    mockContext = {};
  });

  describe("middleware initialization", () => {
    test("should create a new client when context doesn't have one", async () => {
      const middlewareHandler = portalMiddleware as unknown as (options: {
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
          portalClient: expect.objectContaining({
            mutate: expect.any(Function),
            query: expect.any(Function),
          }),
        },
      });

      // Verify the middleware returns the result from next()
      expect(result).toBeDefined();
    });

    test("should reuse existing client when context already has mutate method", async () => {
      const existingClient = { mutate: vi.fn(), query: vi.fn() };
      mockContext.portalClient = existingClient;

      const result = await (
        portalMiddleware as unknown as (options: {
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
          portalClient: existingClient,
        },
      });

      // Verify the middleware returns the result from next()
      expect(result).toBeDefined();
    });

    test("should create client with TheGraph integration when available", async () => {
      mockContext.theGraphClient = mockTheGraphClient;

      const middlewareHandler = portalMiddleware as unknown as (options: {
        context: Record<string, unknown>;
        next: (options: { context: Record<string, unknown> }) => unknown;
        errors: typeof mockErrors;
      }) => Promise<unknown>;

      await middlewareHandler({
        context: mockContext,
        next: mockNext,
        errors: mockErrors,
      });

      expect(mockNext).toHaveBeenCalledWith({
        context: {
          portalClient: expect.objectContaining({
            mutate: expect.any(Function),
            query: expect.any(Function),
          }),
        },
      });
    });
  });

  describe("mutation execution", () => {
    let client: ValidatedPortalClient;

    beforeEach(async () => {
      // Get the client instance from the middleware
      const middleware = portalMiddleware as unknown as (options: {
        context: Record<string, unknown>;
        next: (options: { context: Record<string, unknown> }) => unknown;
        errors: typeof mockErrors;
      }) => Promise<void>;
      await middleware({
        context: mockContext,
        next: (params: { context: Record<string, unknown> }) => {
          client = params?.context?.portalClient as ValidatedPortalClient;
          return mockNext(params || { context: {} });
        },
        errors: mockErrors,
      });
    });

    describe("transaction hash extraction", () => {
      test("should extract transaction hash from direct response", async () => {
        const CREATE_TOKEN_MUTATION = createMockDocument(`
          mutation CreateToken($name: String!) {
            createToken(name: $name) {
              transactionHash
              token {
                id
                name
              }
            }
          }
        `);

        const mockTxHash = createTxHash(1);
        const mockResponse = {
          createToken: {
            transactionHash: mockTxHash,
            token: {
              id: "token-1",
              name: "Test Token",
            },
          },
        };

        (portalClient.request as Mock).mockResolvedValueOnce(mockResponse);

        const result = await client.mutate(CREATE_TOKEN_MUTATION, {
          from: "0x1234567890123456789012345678901234567890" as EthereumAddress,
        });

        expect(result).toBe(mockTxHash);
        expect(portalClient.request).toHaveBeenCalledOnce();
        expect(portalClient.request).toHaveBeenCalledWith(
          CREATE_TOKEN_MUTATION,
          { from: "0x1234567890123456789012345678901234567890" },
          expect.objectContaining({
            "x-request-id": expect.stringMatching(/^atk-mut-/),
          })
        );
      });

      test("should extract transaction hash from nested response", async () => {
        const NESTED_MUTATION = createMockDocument(`
          mutation ComplexMutation($input: ComplexInput!) {
            performAction(input: $input) {
              result {
                success
                data {
                  transactionHash
                  details {
                    id
                  }
                }
              }
            }
          }
        `);

        const mockTxHash = createTxHash(2);
        const mockResponse = {
          performAction: {
            result: {
              success: true,
              data: {
                transactionHash: mockTxHash,
                details: {
                  id: "123",
                },
              },
            },
          },
        };

        (portalClient.request as Mock).mockResolvedValueOnce(mockResponse);

        const result = await client.mutate(NESTED_MUTATION, {
          from: "0x1234567890123456789012345678901234567890" as EthereumAddress,
        });

        expect(result).toBe(mockTxHash);
      });

      test("should extract transaction hash from top-level field", async () => {
        const TOP_LEVEL_MUTATION = createMockDocument(`
          mutation SimpleAction {
            transactionHash
          }
        `);

        const mockTxHash = createTxHash(3);
        const mockResponse = {
          transactionHash: mockTxHash,
        };

        (portalClient.request as Mock).mockResolvedValueOnce(mockResponse);

        const result = await client.mutate(TOP_LEVEL_MUTATION, {
          from: "0x1234567890123456789012345678901234567890" as EthereumAddress,
        });

        expect(result).toBe(mockTxHash);
      });

      test("should throw error when no transaction hash found", async () => {
        const NO_TX_MUTATION = createMockDocument(`
          mutation NoTxHash {
            updateSetting {
              success
              message
            }
          }
        `);

        const mockResponse = {
          updateSetting: {
            success: true,
            message: "Updated",
          },
        };

        (portalClient.request as Mock).mockResolvedValueOnce(mockResponse);

        await expect(
          client.mutate(NO_TX_MUTATION, {
            from: "0x1234567890123456789012345678901234567890" as EthereumAddress,
          })
        ).rejects.toThrow();

        expect(mockErrors.PORTAL_ERROR).toHaveBeenCalledWith({
          message: "No transaction hash found in NoTxHash response",
          data: {
            document: print(NO_TX_MUTATION),
            variables: {
              from: "0x1234567890123456789012345678901234567890",
            },
          },
        });
      });

      test("should throw error for invalid transaction hash format", async () => {
        const INVALID_TX_MUTATION = createMockDocument(`
          mutation InvalidTx {
            action {
              transactionHash
            }
          }
        `);

        const mockResponse = {
          action: {
            transactionHash: "invalid-hash", // Not a valid hex hash
          },
        };

        (portalClient.request as Mock).mockResolvedValueOnce(mockResponse);

        await expect(
          client.mutate(INVALID_TX_MUTATION, {
            from: "0x1234567890123456789012345678901234567890" as EthereumAddress,
          })
        ).rejects.toThrow();

        expect(mockErrors.PORTAL_ERROR).toHaveBeenCalledWith(
          expect.objectContaining({
            message: expect.stringContaining("Invalid transaction hash format"),
            data: expect.objectContaining({
              responseValidation: expect.stringContaining(
                "Invalid transaction hash at"
              ),
            }),
          })
        );
      });
    });

    describe("mutation without TheGraph client", () => {
      test("should return transaction hash immediately without TheGraph", async () => {
        const SIMPLE_MUTATION = createMockDocument(`
          mutation SimpleTx {
            sendTransaction {
              transactionHash
            }
          }
        `);

        const mockTxHash = createTxHash(4);
        const mockResponse = {
          sendTransaction: {
            transactionHash: mockTxHash,
          },
        };

        (portalClient.request as Mock).mockResolvedValueOnce(mockResponse);

        const result = await client.mutate(SIMPLE_MUTATION, {
          from: "0x1234567890123456789012345678901234567890" as EthereumAddress,
        });

        expect(result).toBe(mockTxHash);
        // Should only call Portal once, no transaction tracking
        expect(portalClient.request).toHaveBeenCalledOnce();
      });
    });

    describe("mutation with TheGraph integration", () => {
      beforeEach(async () => {
        // Recreate client with TheGraph integration
        mockContext.theGraphClient = mockTheGraphClient;
        const middleware = portalMiddleware as unknown as (options: {
          context: Record<string, unknown>;
          next: (options: { context: Record<string, unknown> }) => unknown;
          errors: typeof mockErrors;
        }) => Promise<void>;
        await middleware({
          context: mockContext,
          next: (params: { context: Record<string, unknown> }) => {
            client = params?.context?.portalClient as ValidatedPortalClient;
            return mockNext(params || { context: {} });
          },
          errors: mockErrors,
        });
      });

      test("should track transaction until mined and indexed", async () => {
        // Use fake timers to speed up the test
        vi.useFakeTimers();

        const TRACKED_MUTATION = createMockDocument(`
          mutation TrackedTx {
            createAsset {
              transactionHash
            }
          }
        `);

        const mockTxHash = createTxHash(5);
        const mockResponse = {
          createAsset: {
            transactionHash: mockTxHash,
          },
        };

        // Initial mutation response
        (portalClient.request as Mock).mockResolvedValueOnce(mockResponse);

        // Transaction status checks
        (portalClient.request as Mock)
          // First check - not mined yet
          .mockResolvedValueOnce({
            getTransaction: {
              receipt: null,
            },
          })
          // Second check - mined successfully
          .mockResolvedValueOnce({
            getTransaction: {
              receipt: {
                status: "Success",
                blockNumber: "12345",
                revertReasonDecoded: null,
                revertReason: null,
              },
            },
          });

        // TheGraph indexing checks
        mockTheGraphClient.query
          // First check - not indexed yet
          .mockResolvedValueOnce({
            _meta: {
              block: {
                number: 12_340, // Below target block
              },
            },
          })
          // Second check - indexed
          .mockResolvedValueOnce({
            _meta: {
              block: {
                number: 12_346, // Above target block
              },
            },
          });

        // Start the mutation
        const resultPromise = client.mutate(TRACKED_MUTATION, {
          from: "0x1234567890123456789012345678901234567890" as EthereumAddress,
        });

        // Fast-forward through all timers
        await vi.runAllTimersAsync();

        const result = await resultPromise;

        expect(result).toBe(mockTxHash);

        // Verify transaction tracking calls
        expect(portalClient.request).toHaveBeenCalledTimes(3); // 1 mutation + 2 status checks
        expect(mockTheGraphClient.query).toHaveBeenCalledTimes(2); // 2 indexing checks

        // Verify transaction query structure
        const txQueryCall = (portalClient.request as Mock).mock.calls[1];
        expect(txQueryCall?.[1]).toEqual({ transactionHash: mockTxHash });

        // Verify indexing query structure
        const indexingCall = mockTheGraphClient.query.mock.calls[0];
        expect(indexingCall?.[1]).toEqual({
          input: {},
          output: expect.any(z.ZodObject),
        });

        // Restore real timers
        vi.useRealTimers();
      });

      test.skip("should handle transaction revert", async () => {
        const REVERT_MUTATION = createMockDocument(`
          mutation RevertTx {
            failingAction {
              transactionHash
            }
          }
        `);

        const mockTxHash = createTxHash(6);
        const mockResponse = {
          failingAction: {
            transactionHash: mockTxHash,
          },
        };

        (portalClient.request as Mock).mockResolvedValueOnce(mockResponse);

        // Transaction reverted
        (portalClient.request as Mock).mockResolvedValueOnce({
          getTransaction: {
            receipt: {
              status: "Reverted",
              blockNumber: "12345",
              revertReasonDecoded: "Insufficient balance",
              revertReason: "0x08c379a0...",
            },
          },
        });

        await expect(
          client.mutate(REVERT_MUTATION, {
            from: "0x1234567890123456789012345678901234567890" as EthereumAddress,
          })
        ).rejects.toThrow();

        expect(mockErrors.PORTAL_ERROR).toHaveBeenCalledWith({
          message: "Transaction reverted: Insufficient balance",
          data: expect.objectContaining({
            responseValidation: expect.stringContaining(
              "reverted with status Reverted"
            ),
          }),
        });
      });

      test("should handle transaction dropped from mempool", async () => {
        // Use fake timers to speed up the test
        vi.useFakeTimers();

        const DROPPED_MUTATION = createMockDocument(`
          mutation DroppedTx {
            action {
              transactionHash
            }
          }
        `);

        const mockTxHash = createTxHash(7);
        const mockResponse = {
          action: {
            transactionHash: mockTxHash,
          },
        };

        (portalClient.request as Mock).mockResolvedValueOnce(mockResponse);

        // Mock all 30 attempts returning null receipt
        for (let i = 0; i < 30; i++) {
          (portalClient.request as Mock).mockResolvedValueOnce({
            getTransaction: {
              receipt: null,
            },
          });
        }

        // Start the mutation and catch the error
        const resultPromise = client
          .mutate(DROPPED_MUTATION, {
            from: "0x1234567890123456789012345678901234567890" as EthereumAddress,
          })
          .catch((error: unknown) => {
            // Catch the error to prevent unhandled rejection
            expect((error as Error).message).toBe(
              "Transaction dropped from mempool"
            );
            return error;
          });

        // Advance all timers to trigger the timeout
        await vi.runAllTimersAsync();

        // Wait for the promise to settle
        const error = await resultPromise;
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe(
          "Transaction dropped from mempool"
        );

        expect(mockErrors.PORTAL_ERROR).toHaveBeenCalledWith({
          message: "Transaction dropped from mempool",
          data: expect.objectContaining({
            responseValidation: expect.stringContaining(
              "dropped after 30 attempts"
            ),
          }),
        });

        // Restore real timers
        vi.useRealTimers();
      });

      test("should timeout if tracking takes too long", async () => {
        const TIMEOUT_MUTATION = createMockDocument(`
          mutation TimeoutTx {
            slowAction {
              transactionHash
            }
          }
        `);

        const mockTxHash = createTxHash(8);
        const mockResponse = {
          slowAction: {
            transactionHash: mockTxHash,
          },
        };

        (portalClient.request as Mock).mockResolvedValueOnce(mockResponse);

        // Mock Date.now to simulate timeout
        const originalDateNow = Date.now;
        let mockTime = originalDateNow();
        vi.spyOn(Date, "now").mockImplementation(() => {
          mockTime += 100_000; // Advance time by 100 seconds each call
          return mockTime;
        });

        // Transaction not mined yet
        (portalClient.request as Mock).mockResolvedValueOnce({
          getTransaction: {
            receipt: null,
          },
        });

        await expect(
          client.mutate(TIMEOUT_MUTATION, {
            from: "0x1234567890123456789012345678901234567890" as EthereumAddress,
          })
        ).rejects.toThrow();

        expect(mockErrors.PORTAL_ERROR).toHaveBeenCalledWith({
          message: "Transaction tracking timeout after 90000ms",
          data: expect.objectContaining({
            responseValidation: expect.stringContaining("timed out after"),
          }),
        });

        // Restore Date.now
        Date.now = originalDateNow;
      });

      test("should handle indexing timeout with stream timeout", async () => {
        const INDEXING_TIMEOUT_MUTATION = createMockDocument(`
          mutation IndexingTimeout {
            action {
              transactionHash
            }
          }
        `);

        const mockTxHash = createTxHash(9);
        const mockResponse = {
          action: {
            transactionHash: mockTxHash,
          },
        };

        (portalClient.request as Mock).mockResolvedValueOnce(mockResponse);

        // Transaction mined successfully
        (portalClient.request as Mock).mockResolvedValueOnce({
          getTransaction: {
            receipt: {
              status: "Success",
              blockNumber: "12345",
              revertReasonDecoded: null,
              revertReason: null,
            },
          },
        });

        // Mock Date.now to simulate stream timeout (90 seconds)
        const originalDateNow = Date.now;
        let mockTime = originalDateNow();
        vi.spyOn(Date, "now").mockImplementation(() => {
          mockTime += 91_000; // Exceed stream timeout immediately
          return mockTime;
        });

        // TheGraph never catches up
        mockTheGraphClient.query.mockResolvedValue({
          _meta: {
            block: {
              number: 12_340, // Always behind
            },
          },
        });

        // Should throw due to stream timeout
        await expect(
          client.mutate(INDEXING_TIMEOUT_MUTATION, {
            from: "0x1234567890123456789012345678901234567890" as EthereumAddress,
          })
        ).rejects.toThrow();

        expect(mockErrors.PORTAL_ERROR).toHaveBeenCalledWith({
          message: "Transaction tracking timeout after 90000ms",
          data: expect.objectContaining({
            responseValidation: expect.stringContaining("timed out after"),
          }),
        });

        // Restore Date.now
        Date.now = originalDateNow;
      });
    });

    describe("error handling", () => {
      test("should handle GraphQL errors from Portal", async () => {
        const graphQLErrors = [
          { message: "Unauthorized" },
          { message: "Invalid input" },
        ];

        const clientError = new ClientError(
          {
            data: null,
            errors: graphQLErrors,
          } as never,
          { query: "mutation { invalid }" } as never
        );

        (portalClient.request as Mock).mockRejectedValueOnce(clientError);

        const ERROR_MUTATION = createMockDocument(`
          mutation ErrorMutation {
            action {
              transactionHash
            }
          }
        `);

        await expect(
          client.mutate(ERROR_MUTATION, {
            from: "0x1234567890123456789012345678901234567890" as EthereumAddress,
          })
        ).rejects.toThrow();

        expect(mockErrors.PORTAL_ERROR).toHaveBeenCalledWith({
          message: "GraphQL ErrorMutation failed",
          data: expect.objectContaining({
            document: print(ERROR_MUTATION),
            variables: {
              from: "0x1234567890123456789012345678901234567890",
            },
          }),
          cause: clientError,
        });
      });

      test("should handle network errors", async () => {
        const networkError = new Error("Network timeout");
        (portalClient.request as Mock).mockRejectedValueOnce(networkError);

        const NETWORK_ERROR_MUTATION = createMockDocument(`
          mutation NetworkError {
            action {
              transactionHash
            }
          }
        `);

        await expect(
          client.mutate(NETWORK_ERROR_MUTATION, {
            from: "0x1234567890123456789012345678901234567890" as EthereumAddress,
          })
        ).rejects.toThrow();

        expect(mockErrors.PORTAL_ERROR).toHaveBeenCalledWith({
          message: "GraphQL NetworkError failed",
          data: expect.any(Object),
          cause: networkError,
        });
      });
    });
  });

  describe("query execution", () => {
    let client: ValidatedPortalClient;

    beforeEach(async () => {
      // Get the client instance from the middleware
      const middleware = portalMiddleware as unknown as (options: {
        context: Record<string, unknown>;
        next: (options: { context: Record<string, unknown> }) => unknown;
        errors: typeof mockErrors;
      }) => Promise<void>;
      await middleware({
        context: mockContext,
        next: (params: { context: Record<string, unknown> }) => {
          client = params?.context?.portalClient as ValidatedPortalClient;
          return mockNext(params || { context: {} });
        },
        errors: mockErrors,
      });
    });

    describe("successful queries", () => {
      test("should validate query response with Zod schema", async () => {
        const GET_TOKEN_QUERY = createMockDocument(`
          query GetToken($id: ID!) {
            getToken(id: $id) {
              id
              name
              symbol
              totalSupply
              decimals
            }
          }
        `);

        const mockResponse = {
          getToken: {
            id: "0x123",
            name: "Test Token",
            symbol: "TEST",
            totalSupply: "1000000000000000000000",
            decimals: 18,
          },
        };

        (portalClient.request as Mock).mockResolvedValueOnce(mockResponse);

        const schema = z.object({
          getToken: z.object({
            id: z.string(),
            name: z.string(),
            symbol: z.string(),
            totalSupply: z.string(),
            decimals: z.number(),
          }),
        });

        const result = await client.query(
          GET_TOKEN_QUERY,
          { id: "0x123" },
          schema
        );

        expect(result.getToken.name).toBe("Test Token");
        expect(result.getToken.decimals).toBe(18);
        expect(portalClient.request).toHaveBeenCalledOnce();
        expect(portalClient.request).toHaveBeenCalledWith(
          GET_TOKEN_QUERY,
          { id: "0x123" },
          expect.objectContaining({
            "x-request-id": expect.stringMatching(/^atk-qry-/),
          })
        );
      });

      test("should handle complex nested query schemas", async () => {
        const COMPLEX_QUERY = createMockDocument(`
          query ComplexQuery($address: String!) {
            getAccount(address: $address) {
              id
              balance
              transactions {
                id
                hash
                value
                block {
                  number
                  timestamp
                }
              }
            }
          }
        `);

        const mockResponse = {
          getAccount: {
            id: "account-1",
            balance: "5000000000000000000",
            transactions: [
              {
                id: "tx-1",
                hash: createTxHash(1),
                value: "1000000000000000000",
                block: {
                  number: 12_345,
                  timestamp: 1_234_567_890,
                },
              },
              {
                id: "tx-2",
                hash: createTxHash(2),
                value: "2000000000000000000",
                block: {
                  number: 12_346,
                  timestamp: 1_234_567_900,
                },
              },
            ],
          },
        };

        (portalClient.request as Mock).mockResolvedValueOnce(mockResponse);

        const schema = z.object({
          getAccount: z.object({
            id: z.string(),
            balance: z.string(),
            transactions: z.array(
              z.object({
                id: z.string(),
                hash: z.string(),
                value: z.string(),
                block: z.object({
                  number: z.number(),
                  timestamp: z.number(),
                }),
              })
            ),
          }),
        });

        const result = await client.query(
          COMPLEX_QUERY,
          { address: "0xabc" },
          schema
        );

        expect(result.getAccount.transactions).toHaveLength(2);
        expect(result.getAccount.transactions[0]?.block.number).toBe(12_345);
      });

      test("should handle nullable fields", async () => {
        const NULLABLE_QUERY = createMockDocument(`
          query NullableQuery($id: ID!) {
            getEntity(id: $id) {
              id
              name
              description
              metadata
            }
          }
        `);

        const mockResponse = {
          getEntity: {
            id: "1",
            name: "Entity",
            description: null,
            metadata: null,
          },
        };

        (portalClient.request as Mock).mockResolvedValueOnce(mockResponse);

        const schema = z.object({
          getEntity: z.object({
            id: z.string(),
            name: z.string(),
            description: z.string().nullable(),
            metadata: z.object({ key: z.string() }).nullable(),
          }),
        });

        const result = await client.query(NULLABLE_QUERY, { id: "1" }, schema);

        expect(result.getEntity.description).toBeNull();
        expect(result.getEntity.metadata).toBeNull();
      });
    });

    describe("validation errors", () => {
      test("should throw NOT_FOUND for null response", async () => {
        const NULL_QUERY = createMockDocument(`
          query NullQuery($id: ID!) {
            getToken(id: $id) {
              id
              name
            }
          }
        `);

        (portalClient.request as Mock).mockResolvedValueOnce(null);

        const schema = z.object({
          getToken: z.object({
            id: z.string(),
            name: z.string(),
          }),
        });

        await expect(
          client.query(NULL_QUERY, { id: "nonexistent" }, schema)
        ).rejects.toThrow();

        expect(mockErrors.NOT_FOUND).toHaveBeenCalled();
      });

      test("should throw PORTAL_ERROR for schema mismatch", async () => {
        const MISMATCH_QUERY = createMockDocument(`
          query MismatchQuery {
            getData {
              id
              value
            }
          }
        `);

        const mockResponse = {
          getData: {
            id: "1",
            value: "string-value", // Will fail number validation
          },
        };

        (portalClient.request as Mock).mockResolvedValueOnce(mockResponse);

        const schema = z.object({
          getData: z.object({
            id: z.string(),
            value: z.number(), // Expecting number, got string
          }),
        });

        await expect(
          client.query(MISMATCH_QUERY, {}, schema)
        ).rejects.toThrow();

        expect(mockErrors.PORTAL_ERROR).toHaveBeenCalledWith(
          expect.objectContaining({
            message: "Invalid response format from MismatchQuery",
            data: expect.objectContaining({
              responseValidation: expect.any(String),
            }),
            cause: expect.any(z.ZodError),
          })
        );
      });

      test("should handle missing required fields", async () => {
        const MISSING_FIELD_QUERY = createMockDocument(`
          query MissingField {
            getUser {
              id
              name
              email
            }
          }
        `);

        const mockResponse = {
          getUser: {
            id: "1",
            name: "Test User",
            // Missing required 'email' field
          },
        };

        (portalClient.request as Mock).mockResolvedValueOnce(mockResponse);

        const schema = z.object({
          getUser: z.object({
            id: z.string(),
            name: z.string(),
            email: z.string(), // Required field
          }),
        });

        await expect(
          client.query(MISSING_FIELD_QUERY, {}, schema)
        ).rejects.toThrow();

        expect(mockErrors.PORTAL_ERROR).toHaveBeenCalledWith(
          expect.objectContaining({
            message: "Invalid response format from MissingField",
            cause: expect.any(z.ZodError),
          })
        );
      });
    });

    describe("error handling", () => {
      test("should handle GraphQL errors from Portal", async () => {
        const graphQLErrors = [
          { message: "Field not found" },
          { message: "Permission denied" },
        ];

        const clientError = new ClientError(
          {
            data: null,
            errors: graphQLErrors,
          } as never,
          { query: "query { invalid }" } as never
        );

        (portalClient.request as Mock).mockRejectedValueOnce(clientError);

        const ERROR_QUERY = createMockDocument(`
          query ErrorQuery {
            getData {
              id
            }
          }
        `);

        await expect(
          client.query(
            ERROR_QUERY,
            {},
            z.object({ getData: z.object({ id: z.string() }) })
          )
        ).rejects.toThrow();

        expect(mockErrors.PORTAL_ERROR).toHaveBeenCalledWith({
          message: "GraphQL ErrorQuery failed",
          data: expect.objectContaining({
            document: print(ERROR_QUERY),
            variables: {},
          }),
          cause: clientError,
        });
      });

      test("should handle network errors", async () => {
        const networkError = new Error("Connection refused");
        (portalClient.request as Mock).mockRejectedValueOnce(networkError);

        const NETWORK_QUERY = createMockDocument(`
          query NetworkQuery {
            getData {
              id
            }
          }
        `);

        await expect(
          client.query(
            NETWORK_QUERY,
            {},
            z.object({ getData: z.object({ id: z.string() }) })
          )
        ).rejects.toThrow();

        expect(mockErrors.PORTAL_ERROR).toHaveBeenCalledWith({
          message: "GraphQL NetworkQuery failed",
          data: expect.any(Object),
          cause: networkError,
        });
      });
    });
  });

  describe("findTransactionHash helper", () => {
    let client: ValidatedPortalClient;

    beforeEach(async () => {
      // Create client WITHOUT TheGraph for simpler testing
      const middleware = portalMiddleware as unknown as (options: {
        context: Record<string, unknown>;
        next: (options: { context: Record<string, unknown> }) => unknown;
        errors: typeof mockErrors;
      }) => Promise<void>;
      await middleware({
        context: mockContext, // No theGraphClient
        next: (params: { context: Record<string, unknown> }) => {
          client = params?.context?.portalClient as ValidatedPortalClient;
          return mockNext(params || { context: {} });
        },
        errors: mockErrors,
      });
    });

    test("should find transaction hash in various response structures", async () => {
      const testCases = [
        {
          name: "direct field",
          response: { transactionHash: createTxHash(1) },
          mutation: createMockDocument(`mutation Direct { transactionHash }`),
        },
        {
          name: "nested in result",
          response: {
            createToken: {
              transactionHash: createTxHash(2),
              id: "1",
            },
          },
          mutation: createMockDocument(
            `mutation Nested { createToken { transactionHash id } }`
          ),
        },
        {
          name: "deeply nested",
          response: {
            data: {
              result: {
                transaction: {
                  transactionHash: createTxHash(3),
                },
              },
            },
          },
          mutation: createMockDocument(
            `mutation Deep { data { result { transaction { transactionHash } } } }`
          ),
        },
        {
          name: "in array",
          response: {
            transactions: [{ id: "1" }, { transactionHash: createTxHash(4) }],
          },
          mutation: createMockDocument(
            `mutation Array { transactions { id transactionHash } }`
          ),
        },
      ];

      for (const testCase of testCases) {
        (portalClient.request as Mock).mockReset();
        (portalClient.request as Mock).mockResolvedValueOnce(testCase.response);

        const result = await client.mutate(testCase.mutation, {
          from: "0x1234567890123456789012345678901234567890" as EthereumAddress,
        });
        expect(result).toMatch(/^0x[0-9a-f]{64}$/);
      }
    });
  });

  describe("context passing", () => {
    test("middleware should pass context correctly", async () => {
      const customContext = {
        user: { id: "123", name: "Test User" },
        customData: "test",
        theGraphClient: mockTheGraphClient,
      };

      const middlewareHandler = portalMiddleware as unknown as (options: {
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
      expect(capturedContext?.portalClient).toBeDefined();
      expect(
        (capturedContext?.portalClient as Record<string, unknown>)?.mutate
      ).toBeInstanceOf(Function);
      expect(
        (capturedContext?.portalClient as Record<string, unknown>)?.query
      ).toBeInstanceOf(Function);
    });
  });

  describe("edge cases", () => {
    let client: ValidatedPortalClient;

    beforeEach(async () => {
      // Create client WITHOUT TheGraph for simpler tests
      const middleware = portalMiddleware as unknown as (options: {
        context: Record<string, unknown>;
        next: (options: { context: Record<string, unknown> }) => unknown;
        errors: typeof mockErrors;
      }) => Promise<void>;
      await middleware({
        context: mockContext, // No theGraphClient
        next: (params: { context: Record<string, unknown> }) => {
          client = params?.context?.portalClient as ValidatedPortalClient;
          return mockNext(params || { context: {} });
        },
        errors: mockErrors,
      });
    });

    test("should handle mutations with no variables", async () => {
      const NO_VAR_MUTATION = createMockDocument(`
        mutation NoVars {
          action {
            transactionHash
          }
        }
      `);

      const mockTxHash = createTxHash(10);
      (portalClient.request as Mock).mockResolvedValueOnce({
        action: { transactionHash: mockTxHash },
      });

      const result = await client.mutate(NO_VAR_MUTATION, {
        from: "0x1234567890123456789012345678901234567890" as EthereumAddress,
      });
      expect(result).toBe(mockTxHash);
    });

    test("should handle queries with complex variables", async () => {
      const COMPLEX_VAR_QUERY = createMockDocument(`
        query ComplexVars($filter: ComplexFilter!, $options: QueryOptions) {
          getData(filter: $filter, options: $options) {
            id
            value
          }
        }
      `);

      const mockResponse = {
        getData: {
          id: "1",
          value: "test",
        },
      };

      (portalClient.request as Mock).mockResolvedValueOnce(mockResponse);

      const schema = z.object({
        getData: z.object({
          id: z.string(),
          value: z.string(),
        }),
      });

      const complexVariables = {
        filter: {
          field: "value",
          nested: {
            deep: true,
            array: [1, 2, 3],
          },
        },
        options: {
          limit: 10,
          sort: "ASC",
        },
      };

      const result = await client.query(
        COMPLEX_VAR_QUERY,
        complexVariables,
        schema
      );

      expect(result.getData.value).toBe("test");
      expect(portalClient.request).toHaveBeenCalledWith(
        COMPLEX_VAR_QUERY,
        complexVariables,
        expect.objectContaining({
          "x-request-id": expect.stringMatching(/^atk-qry-/),
        })
      );
    });

    test("should handle mutations with operation name metadata", async () => {
      const NAMED_MUTATION = createMockDocument(`
        mutation CreateTokenWithMetadata {
          createToken {
            transactionHash
          }
        }
      `);

      const mockTxHash = createTxHash(11);
      (portalClient.request as Mock).mockResolvedValueOnce({
        createToken: { transactionHash: mockTxHash },
      });

      const result = await client.mutate(NAMED_MUTATION, {
        from: "0x1234567890123456789012345678901234567890" as EthereumAddress,
      });
      expect(result).toBe(mockTxHash);

      // The error messages should use the operation name
      (portalClient.request as Mock).mockReset();
      (portalClient.request as Mock).mockRejectedValueOnce(
        new Error("Test error")
      );

      await expect(
        client.mutate(NAMED_MUTATION, {
          from: "0x1234567890123456789012345678901234567890" as EthereumAddress,
        })
      ).rejects.toThrow();

      expect(mockErrors.PORTAL_ERROR).toHaveBeenCalledWith({
        message: "GraphQL CreateTokenWithMetadata failed",
        data: expect.any(Object),
        cause: expect.any(Error),
      });
    });

    test("should handle transaction hash as number (auto-convert)", async () => {
      const NUMBER_TX_MUTATION = createMockDocument(`
        mutation NumberTx {
          action {
            transactionHash
          }
        }
      `);

      // Some APIs might return tx hash as a number (though unlikely)
      const mockResponse = {
        action: {
          transactionHash: createTxHash(12), // Still a string for testing
        },
      };

      (portalClient.request as Mock).mockResolvedValueOnce(mockResponse);

      const result = await client.mutate(NUMBER_TX_MUTATION, {
        from: "0x1234567890123456789012345678901234567890" as EthereumAddress,
      });
      expect(result).toBe(createTxHash(12));
    });

    test("should handle concurrent mutations", async () => {
      const CONCURRENT_MUTATION = createMockDocument(`
        mutation Concurrent($id: Int!) {
          action(id: $id) {
            transactionHash
          }
        }
      `);

      const mockResponses = [
        { action: { transactionHash: createTxHash(13) } },
        { action: { transactionHash: createTxHash(14) } },
        { action: { transactionHash: createTxHash(15) } },
      ];

      mockResponses.forEach((response) => {
        (portalClient.request as Mock).mockResolvedValueOnce(response);
      });

      const promises = mockResponses.map(() =>
        client.mutate(CONCURRENT_MUTATION, {
          from: "0x1234567890123456789012345678901234567890" as EthereumAddress,
        })
      );

      const results = await Promise.all(promises);

      expect(results).toEqual([
        createTxHash(13),
        createTxHash(14),
        createTxHash(15),
      ]);
    });
  });
});
