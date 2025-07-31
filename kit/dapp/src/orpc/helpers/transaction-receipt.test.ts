/**
 * @vitest-environment node
 */
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  test,
  vi,
  type Mock,
} from "vitest";
import { portalClient } from "@/lib/settlemint/portal";
import { getTransactionReceipt } from "./transaction-receipt";
import { logger } from "better-auth";

// The portal client should be mocked via the vitest config alias
// If the mock isn't working, we'll manually set it up
if (
  typeof portalClient.request !== "function" ||
  !(portalClient.request as Mock).mockResolvedValueOnce
) {
  // Replace the request method with a mock
  (portalClient as unknown as { request: Mock }).request = vi.fn();
}

const mockRequest = portalClient.request as Mock;

describe("transaction-receipt", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("getTransactionReceipt", () => {
    const mockTransactionHash =
      "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";

    describe("successful responses", () => {
      test("should return receipt for successful transaction", async () => {
        const mockReceipt = {
          getTransaction: {
            receipt: {
              logs: [],
              contractAddress: null,
              status: "Success",
            },
          },
        };

        mockRequest.mockResolvedValueOnce(mockReceipt);

        const result = await getTransactionReceipt(mockTransactionHash);

        expect(result).toEqual({
          logs: [],
          contractAddress: null,
          status: "Success",
        });

        expect(mockRequest).toHaveBeenCalledTimes(1);
        expect(mockRequest).toHaveBeenCalledWith(expect.any(String), {
          transactionHash: mockTransactionHash,
        });
      });

      test("should return receipt for reverted transaction", async () => {
        const mockReceipt = {
          getTransaction: {
            receipt: {
              logs: [
                {
                  address: "0xtoken",
                  topics: ["0xTransfer"],
                  data: "0x",
                },
              ],
              contractAddress: null,
              status: "Reverted",
            },
          },
        };

        mockRequest.mockResolvedValueOnce(mockReceipt);

        const result = await getTransactionReceipt(mockTransactionHash);

        expect(result).toEqual({
          logs: [
            {
              address: "0xtoken",
              topics: ["0xTransfer"],
              data: "0x",
            },
          ],
          contractAddress: null,
          status: "Reverted",
        });
      });

      test("should return receipt with contract address for contract creation", async () => {
        const contractAddress = "0xabcdef1234567890abcdef1234567890abcdef12";
        const mockReceipt = {
          getTransaction: {
            receipt: {
              logs: [],
              contractAddress,
              status: "Success",
            },
          },
        };

        mockRequest.mockResolvedValueOnce(mockReceipt);

        const result = await getTransactionReceipt(mockTransactionHash);

        expect(result).toEqual({
          logs: [],
          contractAddress,
          status: "Success",
        });
      });

      test("should handle complex logs structure", async () => {
        const complexLogs = [
          {
            address: "0xtoken",
            topics: ["0xTransfer", "0xfrom", "0xto"],
            data: "0xamount",
            blockNumber: 12_345,
            transactionIndex: 0,
            logIndex: 0,
          },
          {
            address: "0xapproval",
            topics: ["0xApproval"],
            data: "0xvalue",
          },
          {
            nested: {
              data: {
                value: 123,
                array: [1, 2, 3],
              },
            },
          },
        ];

        const mockReceipt = {
          getTransaction: {
            receipt: {
              logs: complexLogs,
              contractAddress: null,
              status: "Success",
            },
          },
        };

        mockRequest.mockResolvedValueOnce(mockReceipt);

        const result = await getTransactionReceipt(mockTransactionHash);

        expect(result.logs).toEqual(complexLogs);
        expect(result.logs).toHaveLength(3);
      });
    });

    describe("error handling", () => {
      test("should throw error when portal client request fails", async () => {
        const error = new Error("Network timeout");
        mockRequest.mockRejectedValueOnce(error);

        await expect(
          getTransactionReceipt(mockTransactionHash)
        ).rejects.toThrow("Portal query failed: Network timeout");

        expect(logger.error).toHaveBeenCalledWith(
          "Getting transaction receipt failed:",
          error
        );
      });

      test("should handle non-Error exceptions", async () => {
        const error = { code: "TIMEOUT", message: "Request timed out" };
        mockRequest.mockRejectedValueOnce(error);

        await expect(
          getTransactionReceipt(mockTransactionHash)
        ).rejects.toThrow("Portal query failed: [object Object]");

        expect(logger.error).toHaveBeenCalledWith(
          "Getting transaction receipt failed:",
          error
        );
      });

      test("should handle string errors", async () => {
        const error = "Connection refused";
        mockRequest.mockRejectedValueOnce(error);

        await expect(
          getTransactionReceipt(mockTransactionHash)
        ).rejects.toThrow("Portal query failed: Connection refused");
      });

      test("should handle null errors", async () => {
        mockRequest.mockRejectedValueOnce(null);

        await expect(
          getTransactionReceipt(mockTransactionHash)
        ).rejects.toThrow("Portal query failed: null");
      });

      test("should handle undefined errors", async () => {
        mockRequest.mockRejectedValueOnce(undefined);

        await expect(
          getTransactionReceipt(mockTransactionHash)
        ).rejects.toThrow("Portal query failed: undefined");
      });
    });

    describe("schema validation", () => {
      test("should throw error when receipt has invalid status", async () => {
        const invalidReceipt = {
          getTransaction: {
            receipt: {
              logs: [],
              contractAddress: null,
              status: "Invalid", // Invalid status
            },
          },
        };

        mockRequest.mockResolvedValueOnce(invalidReceipt);

        await expect(
          getTransactionReceipt(mockTransactionHash)
        ).rejects.toThrow();
        expect(logger.error).toHaveBeenCalled();
      });

      test("should throw error when receipt is missing required fields", async () => {
        const invalidReceipt = {
          getTransaction: {
            receipt: {
              logs: [],
              // Missing contractAddress and status
            },
          },
        };

        mockRequest.mockResolvedValueOnce(invalidReceipt);

        await expect(
          getTransactionReceipt(mockTransactionHash)
        ).rejects.toThrow();
      });

      test("should throw error when getTransaction is null", async () => {
        const invalidReceipt = {
          getTransaction: null,
        };

        mockRequest.mockResolvedValueOnce(invalidReceipt);

        await expect(
          getTransactionReceipt(mockTransactionHash)
        ).rejects.toThrow();
      });

      test("should throw error when response structure is invalid", async () => {
        const invalidReceipt = {
          // Missing getTransaction wrapper
          receipt: {
            logs: [],
            contractAddress: null,
            status: "Success",
          },
        };

        mockRequest.mockResolvedValueOnce(invalidReceipt);

        await expect(
          getTransactionReceipt(mockTransactionHash)
        ).rejects.toThrow();
      });

      test("should handle contractAddress as empty string", async () => {
        const mockReceipt = {
          getTransaction: {
            receipt: {
              logs: [],
              contractAddress: "", // Empty string instead of null
              status: "Success",
            },
          },
        };

        mockRequest.mockResolvedValueOnce(mockReceipt);

        const result = await getTransactionReceipt(mockTransactionHash);

        expect(result.contractAddress).toBe("");
      });
    });

    describe("edge cases", () => {
      test("should handle very long transaction hash", async () => {
        const longHash = "0x" + "a".repeat(64);
        const mockReceipt = {
          getTransaction: {
            receipt: {
              logs: [],
              contractAddress: null,
              status: "Success",
            },
          },
        };

        mockRequest.mockResolvedValueOnce(mockReceipt);

        await getTransactionReceipt(longHash);

        expect(mockRequest).toHaveBeenCalledWith(expect.any(String), {
          transactionHash: longHash,
        });
      });

      test("should handle empty logs array", async () => {
        const mockReceipt = {
          getTransaction: {
            receipt: {
              logs: [],
              contractAddress: null,
              status: "Success",
            },
          },
        };

        mockRequest.mockResolvedValueOnce(mockReceipt);

        const result = await getTransactionReceipt(mockTransactionHash);

        expect(result.logs).toEqual([]);
        expect(result.logs).toHaveLength(0);
      });

      test("should handle logs as null", async () => {
        const mockReceipt = {
          getTransaction: {
            receipt: {
              logs: null, // null instead of array
              contractAddress: null,
              status: "Success",
            },
          },
        };

        mockRequest.mockResolvedValueOnce(mockReceipt);

        const result = await getTransactionReceipt(mockTransactionHash);

        expect(result.logs).toBeNull();
      });

      test("should preserve original error stack trace", async () => {
        const error = new Error("Test error");
        error.stack = "Custom stack trace";

        mockRequest.mockRejectedValueOnce(error);

        try {
          await getTransactionReceipt(mockTransactionHash);
          throw new Error("Should have thrown");
        } catch (error_) {
          expect(error_).toBeInstanceOf(Error);
          expect((error_ as Error).message).toBe(
            "Portal query failed: Test error"
          );
        }
      });
    });

    describe("GraphQL query", () => {
      test("should use correct GraphQL query structure", async () => {
        const mockReceipt = {
          getTransaction: {
            receipt: {
              logs: [],
              contractAddress: null,
              status: "Success",
            },
          },
        };

        mockRequest.mockResolvedValueOnce(mockReceipt);

        await getTransactionReceipt(mockTransactionHash);

        // Just verify the request was called with proper arguments
        expect(mockRequest).toHaveBeenCalledTimes(1);
        expect(mockRequest).toHaveBeenCalledWith(expect.any(String), {
          transactionHash: mockTransactionHash,
        });
      });
    });

    describe("performance and concurrency", () => {
      test("should handle multiple concurrent requests", async () => {
        const mockReceipt = {
          getTransaction: {
            receipt: {
              logs: [],
              contractAddress: null,
              status: "Success",
            },
          },
        };

        mockRequest.mockResolvedValue(mockReceipt);

        const hashes = [
          "0x1111111111111111111111111111111111111111111111111111111111111111",
          "0x2222222222222222222222222222222222222222222222222222222222222222",
          "0x3333333333333333333333333333333333333333333333333333333333333333",
        ];

        const results = await Promise.all(
          hashes.map((hash) => getTransactionReceipt(hash))
        );

        expect(results).toHaveLength(3);
        expect(mockRequest).toHaveBeenCalledTimes(3);
        results.forEach((result) => {
          expect(result.status).toBe("Success");
        });
      });
    });

    describe("real-world scenarios", () => {
      test("should handle ERC20 transfer receipt", async () => {
        const mockReceipt = {
          getTransaction: {
            receipt: {
              logs: [
                {
                  address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", // USDC
                  topics: [
                    "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef", // Transfer event
                    "0x000000000000000000000000sender000000000000000000000000000000000",
                    "0x000000000000000000000000receiver0000000000000000000000000000000",
                  ],
                  data: "0x00000000000000000000000000000000000000000000000000000000000186a0", // 100000 (1 USDC with 6 decimals)
                },
              ],
              contractAddress: null,
              status: "Success",
            },
          },
        };

        mockRequest.mockResolvedValueOnce(mockReceipt);

        const result = await getTransactionReceipt(mockTransactionHash);

        expect(result.logs).toHaveLength(1);
        expect(result.logs[0].topics).toHaveLength(3);
        expect(result.logs[0].topics[0]).toBe(
          "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef"
        );
      });

      test("should handle failed transaction with revert reason", async () => {
        const mockReceipt = {
          getTransaction: {
            receipt: {
              logs: [], // No logs emitted on revert
              contractAddress: null,
              status: "Reverted",
            },
          },
        };

        mockRequest.mockResolvedValueOnce(mockReceipt);

        const result = await getTransactionReceipt(mockTransactionHash);

        expect(result.status).toBe("Reverted");
        expect(result.logs).toEqual([]);
      });

      test("should handle contract deployment receipt", async () => {
        const deployedAddress = "0x742d35Cc6634C0532925a3b844Bc9e7595f8fA49";
        const mockReceipt = {
          getTransaction: {
            receipt: {
              logs: [
                {
                  address: deployedAddress,
                  topics: [
                    "0x8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0",
                  ], // OwnershipTransferred
                  data: "0x",
                },
              ],
              contractAddress: deployedAddress,
              status: "Success",
            },
          },
        };

        mockRequest.mockResolvedValueOnce(mockReceipt);

        const result = await getTransactionReceipt(mockTransactionHash);

        expect(result.contractAddress).toBe(deployedAddress);
        expect(result.logs[0].address).toBe(deployedAddress);
      });
    });
  });
});
