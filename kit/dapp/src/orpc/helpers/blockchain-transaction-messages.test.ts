/**
 * @vitest-environment node
 */
import type { TOptions } from "i18next";
import { describe, expect, test, vi } from "vitest";
import type { i18nContext } from "@/orpc/middlewares/i18n/i18n.middleware";
import {
  getBlockchainTransactionMessages,
  type BlockchainTransactionMessages,
} from "./blockchain-transaction-messages";

describe("blockchain-transaction-messages", () => {
  // Mock translation function
  const createMockT = (translations: Record<string, string> = {}) => {
    const t = vi.fn((key: string, options?: TOptions) => {
      // If a translation exists, return it
      if (translations[key]) {
        return translations[key];
      }
      // Otherwise return the key itself (simulating missing translation)
      return `${key}${options ? JSON.stringify(options) : ""}`;
    }) as i18nContext["t"];
    return t;
  };

  describe("getBlockchainTransactionMessages", () => {
    test("should return all required message keys", () => {
      const t = createMockT();
      const _messages = getBlockchainTransactionMessages(t);

      // Check that all properties exist
      expect(_messages).toHaveProperty("waitingForMining");
      expect(_messages).toHaveProperty("transactionFailed");
      expect(_messages).toHaveProperty("transactionDropped");
      expect(_messages).toHaveProperty("waitingForIndexing");
      expect(_messages).toHaveProperty("transactionIndexed");
      expect(_messages).toHaveProperty("indexingTimeout");
      expect(_messages).toHaveProperty("streamTimeout");

      // Check that t was called with correct keys
      expect(t).toHaveBeenCalledWith(
        "blockchain:transactions.tracking.waitingForMining",
        undefined
      );
      expect(t).toHaveBeenCalledWith(
        "blockchain:transactions.tracking.transactionFailed",
        undefined
      );
      expect(t).toHaveBeenCalledWith(
        "blockchain:transactions.tracking.transactionDropped",
        undefined
      );
      expect(t).toHaveBeenCalledWith(
        "blockchain:transactions.tracking.waitingForIndexing",
        undefined
      );
      expect(t).toHaveBeenCalledWith(
        "blockchain:transactions.tracking.transactionIndexed",
        undefined
      );
      expect(t).toHaveBeenCalledWith(
        "blockchain:transactions.tracking.indexingTimeout",
        undefined
      );
      expect(t).toHaveBeenCalledWith(
        "blockchain:transactions.tracking.streamTimeout",
        undefined
      );

      // Verify exactly 7 calls were made
      expect(t).toHaveBeenCalledTimes(7);
    });

    test("should return translated values when translations exist", () => {
      const translations = {
        "blockchain:transactions.tracking.waitingForMining":
          "Waiting for transaction to be mined...",
        "blockchain:transactions.tracking.transactionFailed":
          "Transaction failed",
        "blockchain:transactions.tracking.transactionDropped":
          "Transaction was dropped",
        "blockchain:transactions.tracking.waitingForIndexing":
          "Waiting for indexing...",
        "blockchain:transactions.tracking.transactionIndexed":
          "Transaction indexed successfully",
        "blockchain:transactions.tracking.indexingTimeout":
          "Indexing timed out",
        "blockchain:transactions.tracking.streamTimeout": "Stream timed out",
      };

      const t = createMockT(translations);
      const _messages = getBlockchainTransactionMessages(t);

      expect(_messages.waitingForMining).toBe(
        "Waiting for transaction to be mined..."
      );
      expect(_messages.transactionFailed).toBe("Transaction failed");
      expect(_messages.transactionDropped).toBe("Transaction was dropped");
      expect(_messages.waitingForIndexing).toBe("Waiting for indexing...");
      expect(_messages.transactionIndexed).toBe(
        "Transaction indexed successfully"
      );
      expect(_messages.indexingTimeout).toBe("Indexing timed out");
      expect(_messages.streamTimeout).toBe("Stream timed out");
    });

    test("should pass through translation options", () => {
      const t = createMockT();
      const options: TOptions = {
        count: 5,
        context: "test",
        defaultValue: "fallback",
      };

      getBlockchainTransactionMessages(t, options);

      // Verify all calls included the options
      expect(t).toHaveBeenCalledWith(
        "blockchain:transactions.tracking.waitingForMining",
        options
      );
      expect(t).toHaveBeenCalledWith(
        "blockchain:transactions.tracking.transactionFailed",
        options
      );
      expect(t).toHaveBeenCalledWith(
        "blockchain:transactions.tracking.transactionDropped",
        options
      );
      expect(t).toHaveBeenCalledWith(
        "blockchain:transactions.tracking.waitingForIndexing",
        options
      );
      expect(t).toHaveBeenCalledWith(
        "blockchain:transactions.tracking.transactionIndexed",
        options
      );
      expect(t).toHaveBeenCalledWith(
        "blockchain:transactions.tracking.indexingTimeout",
        options
      );
      expect(t).toHaveBeenCalledWith(
        "blockchain:transactions.tracking.streamTimeout",
        options
      );
    });

    test("should handle missing translations gracefully", () => {
      const t = createMockT();
      const _messages = getBlockchainTransactionMessages(t);

      // When translations are missing, the keys should be returned
      expect(_messages.waitingForMining).toBe(
        "blockchain:transactions.tracking.waitingForMining"
      );
      expect(_messages.transactionFailed).toBe(
        "blockchain:transactions.tracking.transactionFailed"
      );
    });

    test("should work with partial translations", () => {
      const translations = {
        "blockchain:transactions.tracking.waitingForMining": "Mining...",
        "blockchain:transactions.tracking.transactionFailed": "Failed!",
        // Other translations missing
      };

      const t = createMockT(translations);
      const _messages = getBlockchainTransactionMessages(t);

      // Translated values
      expect(_messages.waitingForMining).toBe("Mining...");
      expect(_messages.transactionFailed).toBe("Failed!");

      // Missing translations return keys
      expect(_messages.transactionDropped).toBe(
        "blockchain:transactions.tracking.transactionDropped"
      );
      expect(_messages.waitingForIndexing).toBe(
        "blockchain:transactions.tracking.waitingForIndexing"
      );
    });

    test("should maintain consistent key structure", () => {
      const t = createMockT();
      getBlockchainTransactionMessages(t);

      // All keys should follow the pattern: blockchain:transactions.tracking.*
      const allKeys = [
        "waitingForMining",
        "transactionFailed",
        "transactionDropped",
        "waitingForIndexing",
        "transactionIndexed",
        "indexingTimeout",
        "streamTimeout",
      ];

      allKeys.forEach((key) => {
        expect(t).toHaveBeenCalledWith(
          `blockchain:transactions.tracking.${key}`,
          undefined
        );
      });
    });

    test("should return same structure type", () => {
      const t = createMockT();
      const _messages = getBlockchainTransactionMessages(t);

      // Type check - all values should be strings
      expect(typeof _messages.waitingForMining).toBe("string");
      expect(typeof _messages.transactionFailed).toBe("string");
      expect(typeof _messages.transactionDropped).toBe("string");
      expect(typeof _messages.waitingForIndexing).toBe("string");
      expect(typeof _messages.transactionIndexed).toBe("string");
      expect(typeof _messages.indexingTimeout).toBe("string");
      expect(typeof _messages.streamTimeout).toBe("string");

      // Structure check
      const expectedKeys = [
        "waitingForMining",
        "transactionFailed",
        "transactionDropped",
        "waitingForIndexing",
        "transactionIndexed",
        "indexingTimeout",
        "streamTimeout",
      ];
      expect(Object.keys(_messages).sort()).toEqual(expectedKeys.sort());
    });

    test("should handle complex translation options", () => {
      const t = createMockT();
      const complexOptions: TOptions = {
        count: 10,
        context: "blockchain",
        defaultValue: "Transaction processing...",
        interpolation: {
          escapeValue: false,
        },
        replace: {
          txHash: "0x123...",
          blockNumber: 12_345,
        },
      };

      getBlockchainTransactionMessages(t, complexOptions);

      // Verify the complex options are passed through
      expect(t).toHaveBeenCalledWith(expect.any(String), complexOptions);
    });

    test("should be pure function - same input produces same output", () => {
      const t = createMockT({
        "blockchain:transactions.tracking.waitingForMining": "Mining...",
      });

      const messages1 = getBlockchainTransactionMessages(t);
      const messages2 = getBlockchainTransactionMessages(t);

      expect(messages1).toEqual(messages2);
      expect(messages1.waitingForMining).toBe(messages2.waitingForMining);
    });

    test("should handle t function that throws errors", () => {
      const errorT = vi.fn(() => {
        throw new Error("Translation error");
      }) as i18nContext["t"];

      expect(() => getBlockchainTransactionMessages(errorT)).toThrow(
        "Translation error"
      );
    });

    test("should match BlockchainTransactionMessages interface", () => {
      const t = createMockT();
      const _messages = getBlockchainTransactionMessages(t);

      // This test ensures the return type matches the interface
      const _typeCheck: BlockchainTransactionMessages = _messages;
      expect(_typeCheck).toBe(_messages);

      // Ensure no extra properties
      const interfaceKeys: (keyof BlockchainTransactionMessages)[] = [
        "waitingForMining",
        "transactionFailed",
        "transactionDropped",
        "waitingForIndexing",
        "transactionIndexed",
        "indexingTimeout",
        "streamTimeout",
      ];

      expect(Object.keys(_messages)).toHaveLength(interfaceKeys.length);
      interfaceKeys.forEach((key) => {
        expect(_messages).toHaveProperty(key);
      });
    });
  });

  describe("integration scenarios", () => {
    test("should work with real-world usage pattern", () => {
      const translations = {
        "blockchain:transactions.tracking.waitingForMining":
          "Waiting for transaction {{txHash}} to be mined...",
        "blockchain:transactions.tracking.transactionFailed":
          "Transaction {{txHash}} failed with reason: {{reason}}",
        "blockchain:transactions.tracking.transactionIndexed":
          "Transaction indexed in block {{blockNumber}}",
      };

      const t = createMockT(translations);
      getBlockchainTransactionMessages(t, {
        replace: {
          txHash: "0xabc123",
          reason: "insufficient funds",
          blockNumber: 999,
        },
      });

      // In real usage, the t function would interpolate these values
      expect(t).toHaveBeenCalledWith(
        "blockchain:transactions.tracking.waitingForMining",
        expect.objectContaining({
          replace: expect.objectContaining({
            txHash: "0xabc123",
          }),
        })
      );
    });

    test("should support multiple languages", () => {
      // Simulate different language contexts
      const enTranslations = {
        "blockchain:transactions.tracking.waitingForMining":
          "Waiting for mining...",
      };

      const deTranslations = {
        "blockchain:transactions.tracking.waitingForMining":
          "Warte auf Mining...",
      };

      const enT = createMockT(enTranslations);
      const deT = createMockT(deTranslations);

      const enMessages = getBlockchainTransactionMessages(enT);
      const deMessages = getBlockchainTransactionMessages(deT);

      expect(enMessages.waitingForMining).toBe("Waiting for mining...");
      expect(deMessages.waitingForMining).toBe("Warte auf Mining...");
    });
  });
});
