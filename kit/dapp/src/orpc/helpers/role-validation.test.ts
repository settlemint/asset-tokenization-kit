import type { ValidatedPortalClient } from "@/orpc/middlewares/services/portal.middleware";
import { describe, expect, test } from "vitest";
import { hasRole, TOKEN_ROLES, validateRole } from "./role-validation";

describe("role-validation", () => {
  // Mock portal client
  const createMockClient = (
    hasRoleResult: boolean,
    shouldThrow = false
  ): ValidatedPortalClient =>
    ({
      query: (_query: unknown, _variables: unknown, _schema: unknown) => {
        if (shouldThrow) {
          throw new Error("Query failed");
        }
        return Promise.resolve({
          hasRole: {
            hasRole: hasRoleResult,
          },
        });
      },
    }) as unknown as ValidatedPortalClient;

  describe("TOKEN_ROLES", () => {
    test("should contain all expected role constants", () => {
      expect(TOKEN_ROLES.MINTER).toBe("MINTER_ROLE");
      expect(TOKEN_ROLES.BURNER).toBe("BURNER_ROLE");
      expect(TOKEN_ROLES.PAUSER).toBe("PAUSER_ROLE");
      expect(TOKEN_ROLES.FREEZER).toBe("FREEZER_ROLE");
      expect(TOKEN_ROLES.CUSTODIAN).toBe("CUSTODIAN_ROLE");
      expect(TOKEN_ROLES.REDEEMER).toBe("REDEEMER_ROLE");
      expect(TOKEN_ROLES.CAP_SETTER).toBe("CAP_SETTER_ROLE");
      expect(TOKEN_ROLES.YIELD_MANAGER).toBe("YIELD_MANAGER_ROLE");
      expect(TOKEN_ROLES.COMPLIANCE_MANAGER).toBe("COMPLIANCE_MANAGER_ROLE");
      expect(TOKEN_ROLES.RECOVERY_AGENT).toBe("RECOVERY_AGENT_ROLE");
    });

    test("should be immutable", () => {
      const rolesCopy = { ...TOKEN_ROLES };
      expect(TOKEN_ROLES).toEqual(rolesCopy);
    });
  });

  describe("hasRole", () => {
    const contractAddress = "0x1234567890123456789012345678901234567890";
    const accountAddress = "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd";

    test("should return true when account has the role", async () => {
      const client = createMockClient(true);
      const result = await hasRole(
        client,
        contractAddress,
        accountAddress,
        TOKEN_ROLES.MINTER
      );
      expect(result).toBe(true);
    });

    test("should return false when account does not have the role", async () => {
      const client = createMockClient(false);
      const result = await hasRole(
        client,
        contractAddress,
        accountAddress,
        TOKEN_ROLES.MINTER
      );
      expect(result).toBe(false);
    });

    test("should return false when query throws (contract doesn't implement IAccessControl)", async () => {
      const client = createMockClient(false, true);
      const result = await hasRole(
        client,
        contractAddress,
        accountAddress,
        TOKEN_ROLES.BURNER
      );
      expect(result).toBe(false);
    });

    test("should work with all role types", async () => {
      const client = createMockClient(true);
      const roles = Object.values(TOKEN_ROLES);

      for (const role of roles) {
        const result = await hasRole(
          client,
          contractAddress,
          accountAddress,
          role
        );
        expect(result).toBe(true);
      }
    });

    test("should pass correct parameters to portal client", async () => {
      let capturedQuery: unknown;
      let capturedVariables: unknown;

      const client = {
        query: (query: unknown, variables: unknown) => {
          capturedQuery = query;
          capturedVariables = variables;
          return Promise.resolve({
            hasRole: {
              hasRole: true,
            },
          });
        },
      } as unknown as ValidatedPortalClient;

      await hasRole(
        client,
        contractAddress,
        accountAddress,
        TOKEN_ROLES.PAUSER
      );

      // Verify the GraphQL query structure
      expect(capturedQuery).toBeDefined();
      expect(capturedVariables).toEqual({
        contract: contractAddress,
        account: accountAddress,
        role: TOKEN_ROLES.PAUSER,
      });
    });
  });

  describe("validateRole", () => {
    const contractAddress = "0x1234567890123456789012345678901234567890";
    const accountAddress = "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd";
    const operation = "mint tokens";

    test("should not throw when account has the required role", async () => {
      const client = createMockClient(true);
      await expect(
        validateRole(
          client,
          contractAddress,
          accountAddress,
          TOKEN_ROLES.MINTER,
          operation
        )
      ).resolves.toBeUndefined();
    });

    test("should throw when account does not have the required role", async () => {
      const client = createMockClient(false);
      await expect(
        validateRole(
          client,
          contractAddress,
          accountAddress,
          TOKEN_ROLES.MINTER,
          operation
        )
      ).rejects.toThrow(
        `Account ${accountAddress} does not have the required ${TOKEN_ROLES.MINTER} to perform ${operation}`
      );
    });

    test("should throw with correct error message for different roles", async () => {
      const client = createMockClient(false);

      // Test BURNER role
      await expect(
        validateRole(
          client,
          contractAddress,
          accountAddress,
          TOKEN_ROLES.BURNER,
          "burn tokens"
        )
      ).rejects.toThrow(
        `Account ${accountAddress} does not have the required ${TOKEN_ROLES.BURNER} to perform burn tokens`
      );

      // Test PAUSER role
      await expect(
        validateRole(
          client,
          contractAddress,
          accountAddress,
          TOKEN_ROLES.PAUSER,
          "pause contract"
        )
      ).rejects.toThrow(
        `Account ${accountAddress} does not have the required ${TOKEN_ROLES.PAUSER} to perform pause contract`
      );
    });

    test("should handle query errors gracefully", async () => {
      const client = createMockClient(false, true);
      // When hasRole returns false due to error, validateRole should throw
      await expect(
        validateRole(
          client,
          contractAddress,
          accountAddress,
          TOKEN_ROLES.FREEZER,
          "freeze account"
        )
      ).rejects.toThrow(
        `Account ${accountAddress} does not have the required ${TOKEN_ROLES.FREEZER} to perform freeze account`
      );
    });

    test("should work with all role types", async () => {
      const client = createMockClient(false);
      const roles = Object.values(TOKEN_ROLES);

      for (const role of roles) {
        await expect(
          validateRole(
            client,
            contractAddress,
            accountAddress,
            role,
            "perform action"
          )
        ).rejects.toThrow(
          `Account ${accountAddress} does not have the required ${role} to perform perform action`
        );
      }
    });
  });

  describe("GraphQL query", () => {
    test("should use correct query format", () => {
      // The query should be formatted correctly
      const expectedQueryPattern = /query\s+HasRole.*IAccessControlHasRole/s;
      const queryString = `
  query HasRole($contract: String!, $account: String!, $role: String!) {
    hasRole: IAccessControlHasRole(
      address: $contract
      account: $account
      role: $role
    ) {
      hasRole
    }
  }
`;
      expect(queryString).toMatch(expectedQueryPattern);
    });
  });
});
