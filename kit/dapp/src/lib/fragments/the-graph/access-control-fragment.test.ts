/**
 * @vitest-environment node
 */
import type { AccessControlRoles } from "@atk/zod/access-control-roles";
import type { ResultOf } from "@graphql-typed-document-node/core";
import { Kind, print } from "graphql";
import { describe, expect, expectTypeOf, it } from "vitest";
import { AccessControlFragment } from "./access-control-fragment";

describe("AccessControlFragment", () => {
  describe("GraphQL fragment", () => {
    it("should be defined", () => {
      expect(AccessControlFragment).toBeDefined();
    });

    it("should be a GraphQL document object", () => {
      // The fragment should be a DocumentNode
      expect(AccessControlFragment).toHaveProperty("kind");
      expect(AccessControlFragment.kind).toBe("Document");
      expect(AccessControlFragment).toHaveProperty("definitions");
      expect(Array.isArray(AccessControlFragment.definitions)).toBe(true);
    });

    it("should have the correct fragment definition", () => {
      // Check the GraphQL document structure
      expect(AccessControlFragment.kind).toBe(Kind.DOCUMENT);
      expect(AccessControlFragment.definitions).toHaveLength(1);

      const fragmentDef = AccessControlFragment.definitions[0];
      expect(fragmentDef).toBeDefined();
      expect(fragmentDef?.kind).toBe(Kind.FRAGMENT_DEFINITION);

      if (fragmentDef && fragmentDef.kind === Kind.FRAGMENT_DEFINITION) {
        expect(fragmentDef.name?.value).toBe("AccessControlFragment");
        expect(fragmentDef.typeCondition.name.value).toBe("AccessControl");
      }
    });

    it("should include all required role fields", () => {
      const fragmentDef = AccessControlFragment.definitions[0];

      if (fragmentDef && fragmentDef.kind === Kind.FRAGMENT_DEFINITION) {
        const selections = fragmentDef.selectionSet.selections;

        // List of all expected roles in the fragment
        const expectedRoles = [
          "addonManager",
          "addonModule",
          "addonRegistryModule",
          "admin",
          "auditor",
          "burner",
          "capManagement",
          "claimPolicyManager",
          "claimIssuer",
          "complianceAdmin",
          "complianceManager",
          "custodian",
          "emergency",
          "forcedTransfer",
          "freezer",
          "fundsManager",
          "globalListManager",
          "governance",
          "identityManager",
          "identityRegistryModule",
          "minter",
          "organisationIdentityManager",
          "pauser",
          "recovery",
          "saleAdmin",
          "signer",
          "supplyManagement",
          "systemManager",
          "systemModule",
          "tokenAdmin",
          "tokenFactoryModule",
          "tokenFactoryRegistryModule",
          "tokenManager",
          "verificationAdmin",
        ];

        // Extract field names from the selections
        const fieldNames = selections
          .filter((selection) => selection.kind === Kind.FIELD)
          .map((selection) => {
            if (selection.kind === Kind.FIELD) {
              return selection.name.value;
            }
            return "";
          });

        expect(fieldNames).toHaveLength(expectedRoles.length + 1);
        expectedRoles.forEach((role) => {
          expect(fieldNames).toContain(role);
        });
      }
    });

    it("should request id field for each role", () => {
      const fragmentDef = AccessControlFragment.definitions[0];

      if (fragmentDef && fragmentDef.kind === Kind.FRAGMENT_DEFINITION) {
        const selections = fragmentDef.selectionSet.selections;

        // Each selection should have a nested selection for 'id' (except for the top-level 'id' field)
        selections.forEach((selection) => {
          if (selection.kind === Kind.FIELD) {
            // The top-level 'id' field is a scalar and doesn't have nested selections
            if (selection.name.value === "id") {
              expect(selection.selectionSet).toBeUndefined();
              return;
            }

            expect(selection.selectionSet).toBeDefined();
            expect(selection.selectionSet?.selections).toHaveLength(2);

            const idSelection = selection.selectionSet?.selections[0];
            if (idSelection && idSelection.kind === Kind.FIELD) {
              expect(idSelection.name.value).toBe("id");
            }

            const isContractSelection = selection.selectionSet?.selections[1];
            if (
              isContractSelection &&
              isContractSelection.kind === Kind.FIELD
            ) {
              expect(isContractSelection.name.value).toBe("isContract");
            }
          }
        });
      }
    });

    it("should be a valid GraphQL fragment", () => {
      // Verify the fragment can be printed as valid GraphQL
      const fragmentString = print(AccessControlFragment);

      expect(fragmentString).toContain("fragment AccessControlFragment");
      expect(fragmentString).toContain("on AccessControl");
      expect(fragmentString).toMatch(/\{\s*id\s*isContract\s*\}/);
    });
  });

  describe("Type definitions", () => {
    it("fragment roles match zod roles (compile-time)", () => {
      // Derive union of role keys from the fragment's inferred result type (excluding top-level id)
      type FragmentAccessControlRoles = Exclude<
        keyof NonNullable<NonNullable<ResultOf<typeof AccessControlFragment>>>,
        "id"
      >;

      // Ensure the fragment-derived role keys equal the zod roles union type
      expectTypeOf<FragmentAccessControlRoles>().toEqualTypeOf<AccessControlRoles>();
    });
  });

  describe("Fragment consistency", () => {
    it("should not include removed legacy roles", () => {
      const fragmentString = print(AccessControlFragment);

      // List of removed legacy roles that should NOT be in the fragment
      const removedRoles = [
        "bypassListManager",
        "bypassListManagerAdmin",
        "claimManager",
        "deployer",
        "implementationManager",
        "registrar",
        "registrarAdmin",
        "registryManager",
        "storageModifier",
      ];

      // Check that removed roles do not appear in the fragment
      removedRoles.forEach((role) => {
        expect(fragmentString).not.toContain(role);
      });
    });
  });
});
