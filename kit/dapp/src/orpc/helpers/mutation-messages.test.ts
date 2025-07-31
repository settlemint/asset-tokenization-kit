/**
 * @vitest-environment node
 */
import type { TOptions } from "i18next";
import { describe, expect, test, vi } from "vitest";
import {
  getMutationMessages,
  getConditionalMutationMessages,
  type MutationMessages,
  type MutationMessageKeys,
} from "./mutation-messages";

describe("mutation-messages", () => {
  // Mock translation function
  const createMockT = (translations: Record<string, string> = {}) => {
    return vi.fn((key: string, options?: TOptions) => {
      if (translations[key]) {
        return translations[key];
      }
      // Return key with options for debugging
      return `${key}${options ? JSON.stringify(options) : ""}`;
    });
  };

  describe("getMutationMessages", () => {
    test("should return standard mutation messages with default keys", () => {
      const t = createMockT();
      const _messages = getMutationMessages(t, "tokens", "mint");

      // Check structure
      expect(_messages).toHaveProperty("pendingMessage");
      expect(_messages).toHaveProperty("successMessage");
      expect(_messages).toHaveProperty("errorMessage");

      // Check translation keys
      expect(t).toHaveBeenCalledWith(
        "tokens:actions.mint.messages.preparing",
        undefined
      );
      expect(t).toHaveBeenCalledWith(
        "tokens:actions.mint.messages.success",
        undefined
      );
      expect(t).toHaveBeenCalledWith(
        "tokens:actions.mint.messages.failed",
        undefined
      );

      expect(t).toHaveBeenCalledTimes(3);
    });

    test("should handle different namespaces and actions", () => {
      const t = createMockT();

      // Test different namespace/action combinations
      getMutationMessages(t, "system", "create");
      expect(t).toHaveBeenCalledWith(
        "system:actions.create.messages.preparing",
        undefined
      );

      getMutationMessages(t, "users", "delete");
      expect(t).toHaveBeenCalledWith(
        "users:actions.delete.messages.failed",
        undefined
      );

      getMutationMessages(t, "contracts", "deploy");
      expect(t).toHaveBeenCalledWith(
        "contracts:actions.deploy.messages.success",
        undefined
      );
    });

    test("should apply suffix when provided", () => {
      const t = createMockT();
      getMutationMessages(t, "tokens", "mint", {
        suffix: "Batch",
      });

      expect(t).toHaveBeenCalledWith(
        "tokens:actions.mint.messages.preparingBatch",
        undefined
      );
      expect(t).toHaveBeenCalledWith(
        "tokens:actions.mint.messages.successBatch",
        undefined
      );
      expect(t).toHaveBeenCalledWith(
        "tokens:actions.mint.messages.failedBatch",
        undefined
      );
    });

    test("should use custom keys when provided", () => {
      const t = createMockT();
      const customKeys: MutationMessageKeys = {
        preparing: "creating",
        success: "created",
        failed: "creationFailed",
      };

      getMutationMessages(t, "system", "item", {
        keys: customKeys,
      });

      expect(t).toHaveBeenCalledWith(
        "system:actions.item.messages.creating",
        undefined
      );
      expect(t).toHaveBeenCalledWith(
        "system:actions.item.messages.created",
        undefined
      );
      expect(t).toHaveBeenCalledWith(
        "system:actions.item.messages.creationFailed",
        undefined
      );
    });

    test("should combine custom keys with suffix", () => {
      const t = createMockT();
      const customKeys: MutationMessageKeys = {
        preparing: "starting",
        success: "completed",
        failed: "error",
      };

      getMutationMessages(t, "process", "batch", {
        keys: customKeys,
        suffix: "All",
      });

      expect(t).toHaveBeenCalledWith(
        "process:actions.batch.messages.startingAll",
        undefined
      );
      expect(t).toHaveBeenCalledWith(
        "process:actions.batch.messages.completedAll",
        undefined
      );
      expect(t).toHaveBeenCalledWith(
        "process:actions.batch.messages.errorAll",
        undefined
      );
    });

    test("should pass translation options through", () => {
      const t = createMockT();
      const tOptions: TOptions = {
        count: 5,
        context: "multiple",
        defaultValue: "default message",
      };

      getMutationMessages(t, "items", "process", {
        translationOptions: tOptions,
      });

      expect(t).toHaveBeenCalledWith(
        "items:actions.process.messages.preparing",
        tOptions
      );
      expect(t).toHaveBeenCalledWith(
        "items:actions.process.messages.success",
        tOptions
      );
      expect(t).toHaveBeenCalledWith(
        "items:actions.process.messages.failed",
        tOptions
      );
    });

    test("should handle partial custom keys", () => {
      const t = createMockT();

      // Only override success key
      getMutationMessages(t, "tokens", "burn", {
        keys: { success: "burned" },
      });

      expect(t).toHaveBeenCalledWith(
        "tokens:actions.burn.messages.preparing", // default
        undefined
      );
      expect(t).toHaveBeenCalledWith(
        "tokens:actions.burn.messages.burned", // custom
        undefined
      );
      expect(t).toHaveBeenCalledWith(
        "tokens:actions.burn.messages.failed", // default
        undefined
      );
    });

    test("should handle empty suffix", () => {
      const t = createMockT();

      getMutationMessages(t, "tokens", "transfer", {
        suffix: "",
      });

      expect(t).toHaveBeenCalledWith(
        "tokens:actions.transfer.messages.preparing",
        undefined
      );
    });

    test("should handle all options combined", () => {
      const t = createMockT();
      const tOptions: TOptions = { count: 10 };

      getMutationMessages(t, "complex", "operation", {
        suffix: "Multi",
        keys: {
          preparing: "initializing",
          success: "done",
          failed: "failed",
        },
        translationOptions: tOptions,
      });

      expect(t).toHaveBeenCalledWith(
        "complex:actions.operation.messages.initializingMulti",
        tOptions
      );
      expect(t).toHaveBeenCalledWith(
        "complex:actions.operation.messages.doneMulti",
        tOptions
      );
      expect(t).toHaveBeenCalledWith(
        "complex:actions.operation.messages.failedMulti",
        tOptions
      );
    });

    test("should return translated values when available", () => {
      const translations = {
        "tokens:actions.mint.messages.preparing": "Preparing to mint tokens...",
        "tokens:actions.mint.messages.success": "Tokens minted successfully!",
        "tokens:actions.mint.messages.failed": "Failed to mint tokens",
      };

      const t = createMockT(translations);
      const _messages = getMutationMessages(t, "tokens", "mint");

      expect(_messages.pendingMessage).toBe("Preparing to mint tokens...");
      expect(_messages.successMessage).toBe("Tokens minted successfully!");
      expect(_messages.errorMessage).toBe("Failed to mint tokens");
    });

    test("should handle special characters in namespace and action", () => {
      const t = createMockT();

      // Test with hyphenated names
      getMutationMessages(t, "my-namespace", "my-action");
      expect(t).toHaveBeenCalledWith(
        "my-namespace:actions.my-action.messages.preparing",
        undefined
      );

      // Test with underscores
      getMutationMessages(t, "my_namespace", "my_action");
      expect(t).toHaveBeenCalledWith(
        "my_namespace:actions.my_action.messages.preparing",
        undefined
      );
    });

    test("should maintain type safety", () => {
      const t = createMockT();
      const _messages = getMutationMessages(t, "test", "action");

      // Type check
      const _typeCheck: MutationMessages = _messages;
      expect(_typeCheck).toBe(_messages);

      // All properties should be strings
      expect(typeof _messages.pendingMessage).toBe("string");
      expect(typeof _messages.successMessage).toBe("string");
      expect(typeof _messages.errorMessage).toBe("string");
    });

    test("should handle t function that throws", () => {
      const errorT = vi.fn(() => {
        throw new Error("Translation error");
      });

      expect(() => getMutationMessages(errorT, "test", "action")).toThrow(
        "Translation error"
      );
    });
  });

  describe("getConditionalMutationMessages", () => {
    test("should add Batch suffix when isBatch is true", () => {
      const t = createMockT();
      getConditionalMutationMessages(t, "tokens", "transfer", true);

      expect(t).toHaveBeenCalledWith(
        "tokens:actions.transfer.messages.preparingBatch",
        undefined
      );
      expect(t).toHaveBeenCalledWith(
        "tokens:actions.transfer.messages.successBatch",
        undefined
      );
      expect(t).toHaveBeenCalledWith(
        "tokens:actions.transfer.messages.failedBatch",
        undefined
      );
    });

    test("should not add suffix when isBatch is false", () => {
      const t = createMockT();
      getConditionalMutationMessages(t, "tokens", "transfer", false);

      expect(t).toHaveBeenCalledWith(
        "tokens:actions.transfer.messages.preparing",
        undefined
      );
      expect(t).toHaveBeenCalledWith(
        "tokens:actions.transfer.messages.success",
        undefined
      );
      expect(t).toHaveBeenCalledWith(
        "tokens:actions.transfer.messages.failed",
        undefined
      );
    });

    test("should pass through other options", () => {
      const t = createMockT();
      const tOptions: TOptions = { count: 3 };
      const customKeys: MutationMessageKeys = {
        preparing: "processing",
        success: "done",
      };

      getConditionalMutationMessages(t, "items", "update", true, {
        keys: customKeys,
        translationOptions: tOptions,
      });

      expect(t).toHaveBeenCalledWith(
        "items:actions.update.messages.processingBatch",
        tOptions
      );
      expect(t).toHaveBeenCalledWith(
        "items:actions.update.messages.doneBatch",
        tOptions
      );
    });

    test("should handle edge cases for isBatch", () => {
      const t = createMockT();

      // TypeScript will enforce boolean, but test runtime behavior
      getConditionalMutationMessages(t, "test", "action", true);
      expect(t).toHaveBeenLastCalledWith(
        "test:actions.action.messages.failedBatch",
        undefined
      );

      getConditionalMutationMessages(t, "test", "action", false);
      expect(t).toHaveBeenLastCalledWith(
        "test:actions.action.messages.failed",
        undefined
      );
    });

    test("should work with real-world batch scenarios", () => {
      const translations = {
        "tokens:actions.mint.messages.preparing": "Preparing to mint token...",
        "tokens:actions.mint.messages.preparingBatch":
          "Preparing to mint multiple tokens...",
        "tokens:actions.mint.messages.success": "Token minted successfully!",
        "tokens:actions.mint.messages.successBatch":
          "All tokens minted successfully!",
        "tokens:actions.mint.messages.failed": "Failed to mint token",
        "tokens:actions.mint.messages.failedBatch":
          "Failed to mint one or more tokens",
      };

      const t = createMockT(translations);

      // Single item
      const singleMessages = getConditionalMutationMessages(
        t,
        "tokens",
        "mint",
        false
      );
      expect(singleMessages.pendingMessage).toBe("Preparing to mint token...");
      expect(singleMessages.successMessage).toBe("Token minted successfully!");
      expect(singleMessages.errorMessage).toBe("Failed to mint token");

      // Multiple items
      const batchMessages = getConditionalMutationMessages(
        t,
        "tokens",
        "mint",
        true
      );
      expect(batchMessages.pendingMessage).toBe(
        "Preparing to mint multiple tokens..."
      );
      expect(batchMessages.successMessage).toBe(
        "All tokens minted successfully!"
      );
      expect(batchMessages.errorMessage).toBe(
        "Failed to mint one or more tokens"
      );
    });

    test("should maintain same behavior as getMutationMessages", () => {
      const t = createMockT();

      // These should produce identical results
      const conditional = getConditionalMutationMessages(
        t,
        "test",
        "action",
        false
      );
      const regular = getMutationMessages(t, "test", "action");

      expect(conditional).toEqual(regular);
    });
  });

  describe("integration scenarios", () => {
    test("should handle complex real-world usage", () => {
      const translations = {
        "tokens:actions.transfer.messages.preparing":
          "Preparing transfer of {{amount}} tokens to {{recipient}}...",
        "tokens:actions.transfer.messages.preparingBatch":
          "Preparing transfer of tokens to {{count}} recipients...",
        "system:actions.create.messages.creating": "Creating new {{type}}...",
        "system:actions.create.messages.created":
          "{{type}} created successfully",
      };

      const t = createMockT(translations);

      // Single transfer with interpolation
      getMutationMessages(t, "tokens", "transfer", {
        translationOptions: {
          replace: {
            amount: 100,
            recipient: "0x123...",
          },
        },
      });

      expect(t).toHaveBeenCalledWith(
        "tokens:actions.transfer.messages.preparing",
        expect.objectContaining({
          replace: expect.objectContaining({
            amount: 100,
            recipient: "0x123...",
          }),
        })
      );

      // Batch transfer
      getConditionalMutationMessages(t, "tokens", "transfer", true, {
        translationOptions: {
          count: 5,
        },
      });

      expect(t).toHaveBeenCalledWith(
        "tokens:actions.transfer.messages.preparingBatch",
        expect.objectContaining({
          count: 5,
        })
      );
    });

    test("should support dynamic action names", () => {
      const t = createMockT();
      const actions = ["mint", "burn", "transfer", "pause", "unpause"];

      actions.forEach((action) => {
        const _messages = getMutationMessages(t, "tokens", action);
        expect(_messages).toHaveProperty("pendingMessage");
        expect(_messages).toHaveProperty("successMessage");
        expect(_messages).toHaveProperty("errorMessage");
      });
    });

    test("should handle missing translations gracefully", () => {
      const t = createMockT();
      const _messages = getMutationMessages(t, "unknown", "action");

      // Should return the translation keys when translations are missing
      expect(_messages.pendingMessage).toBe(
        "unknown:actions.action.messages.preparing"
      );
      expect(_messages.successMessage).toBe(
        "unknown:actions.action.messages.success"
      );
      expect(_messages.errorMessage).toBe(
        "unknown:actions.action.messages.failed"
      );
    });
  });
});
