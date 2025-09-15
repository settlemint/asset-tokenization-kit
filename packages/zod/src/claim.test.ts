/**
 * @fileoverview Test suite for identity claim validation and parsing
 *
 * This test suite validates identity claim structure, issuer information,
 * and claim value arrays, ensuring proper data handling for user identity verification.
 *
 * Test Strategy:
 * - Structure Validation: Required fields and proper typing
 * - Issuer Validation: Ethereum address format for issuer IDs
 * - Values Array: Key-value pair validation and array handling
 * - Revocation Status: Boolean flag handling
 * - Edge Cases: Empty values arrays, missing fields, invalid data types
 * - Type Safety: Branded type system for claim data integrity
 * - Error Handling: Specific error messages for different validation failures
 *
 * TYPE SAFETY PATTERNS:
 * - Optional Chaining: Used with array indexing due to TypeScript strict mode
 *   (noUncheckedIndexedAccess) which makes array[index] potentially undefined
 * - Destructuring with Underscore: Intentional unused variable naming (_var)
 *   prevents linting warnings while clearly communicating intent
 * - Type Assertions: Strategic use of 'as unknown as T' to test runtime validation
 *   bypassing compile-time checks to verify Zod catches invalid external data
 *
 * WHY STRICT TYPING: Identity claims are critical security components in blockchain
 * asset tokenization. Type safety prevents runtime errors that could compromise
 * user verification, compliance validation, and trust chain integrity.
 *
 * SECURITY: Invalid claims could compromise identity verification systems
 * STANDARD: Ensures claims match subgraph schema and API expectations
 */

import { describe, expect, it } from "bun:test";
import {
  identityClaim,
  claimValue,
  claimIssuer,
  isIdentityClaim,
  parseIdentityClaim,
} from "./claim";

describe("claimValue", () => {
  describe("valid claim values", () => {
    it("should accept valid key-value pairs", () => {
      // WHY: Claim values contain structured data as string key-value pairs
      const validValue = {
        key: "name",
        value: "John Doe",
      };

      const result = claimValue.parse(validValue);
      expect(result).toEqual(validValue);
      expect(result.key).toBe("name");
      expect(result.value).toBe("John Doe");
    });

    it("should accept empty string values", () => {
      // WHY: Some claim values may legitimately be empty
      const validValue = {
        key: "optional_field",
        value: "",
      };

      const result = claimValue.parse(validValue);
      expect(result).toEqual(validValue);
    });
  });

  describe("invalid claim values", () => {
    it("should reject missing key field", () => {
      const invalidValue = {
        value: "test",
      };

      expect(() => claimValue.parse(invalidValue)).toThrow();
    });

    it("should reject missing value field", () => {
      const invalidValue = {
        key: "test",
      };

      expect(() => claimValue.parse(invalidValue)).toThrow();
    });

    it("should reject non-string key", () => {
      const invalidValue = {
        key: 123,
        value: "test",
      };

      expect(() => claimValue.parse(invalidValue)).toThrow();
    });

    it("should reject non-string value", () => {
      const invalidValue = {
        key: "test",
        value: 123,
      };

      expect(() => claimValue.parse(invalidValue)).toThrow();
    });
  });
});

describe("claimIssuer", () => {
  describe("valid claim issuers", () => {
    it("should accept valid Ethereum address", () => {
      // WHY: Claim issuers are identified by their Ethereum addresses
      const validIssuer = {
        id: "0x71c7656ec7ab88b098defb751b7401b5f6d8976f",
      };

      const result = claimIssuer.parse(validIssuer);
      expect(result.id).toBe("0x71C7656EC7ab88b098defB751B7401B5f6d8976F");
    });
  });

  describe("invalid claim issuers", () => {
    it("should reject invalid Ethereum address", () => {
      const invalidIssuer = {
        id: "invalid-address",
      };

      expect(() => claimIssuer.parse(invalidIssuer)).toThrow();
    });

    it("should reject missing id field", () => {
      const invalidIssuer = {};

      expect(() => claimIssuer.parse(invalidIssuer)).toThrow();
    });
  });
});

describe("identityClaim", () => {
  const validClaim = {
    id: "0x123abc-42",
    name: "KYC Verification",
    revoked: false,
    issuer: {
      id: "0x71c7656ec7ab88b098defb751b7401b5f6d8976f",
    },
    values: [
      { key: "name", value: "John Doe" },
      { key: "verified", value: "true" },
    ],
  };

  describe("valid identity claims", () => {
    it("should accept a complete valid claim", () => {
      // WHY: Full claim structure with all required fields
      const result = identityClaim.parse(validClaim);

      expect(result.id).toBe("0x123abc-42");
      expect(result.name).toBe("KYC Verification");
      expect(result.revoked).toBe(false);
      expect(result.issuer.id).toBe(
        "0x71C7656EC7ab88b098defB751B7401B5f6d8976F"
      );
      expect(result.values).toHaveLength(2);

      // WHY: Optional chaining prevents runtime errors if array indexing fails
      // TypeScript's strict mode with noUncheckedIndexedAccess requires this
      // safety check since array[index] can return undefined. This protects
      // against out-of-bounds access and maintains type safety throughout
      // the test suite, especially important for identity claim validation
      // where data integrity is critical for security compliance.
      expect(result.values[0]?.key).toBe("name");
      expect(result.values[0]?.value).toBe("John Doe");
    });

    it("should accept claim with empty values array", () => {
      // WHY: Some claims may not have additional data
      const claimWithoutValues = {
        ...validClaim,
        values: [],
      };

      const result = identityClaim.parse(claimWithoutValues);
      expect(result.values).toHaveLength(0);
    });

    it("should accept revoked claim", () => {
      // WHY: Claims can be revoked and this should be tracked
      const revokedClaim = {
        ...validClaim,
        revoked: true,
      };

      const result = identityClaim.parse(revokedClaim);
      expect(result.revoked).toBe(true);
    });
  });

  describe("invalid identity claims", () => {
    it("should reject claim with missing id", () => {
      // WHY: Underscore prefix (_id) signals intentionally unused extracted variable
      // This destructuring pattern safely removes the 'id' field while clearly
      // communicating to TypeScript and developers that the extracted value
      // is intentionally discarded. This prevents "unused variable" linting
      // warnings while maintaining explicit field removal for test isolation.
      const { id: _id, ...claimWithoutId } = validClaim;

      expect(() => identityClaim.parse(claimWithoutId)).toThrow();
    });

    it("should reject claim with missing name", () => {
      // WHY: Consistent destructuring pattern for intentional field removal
      const { name: _name, ...claimWithoutName } = validClaim;

      expect(() => identityClaim.parse(claimWithoutName)).toThrow();
    });

    it("should reject claim with missing revoked field", () => {
      // WHY: Revoked field is required for claim validity tracking
      const { revoked: _revoked, ...claimWithoutRevoked } = validClaim;

      expect(() => identityClaim.parse(claimWithoutRevoked)).toThrow();
    });

    it("should reject claim with missing issuer", () => {
      // WHY: Issuer identification is critical for claim trust chain
      const { issuer: _issuer, ...claimWithoutIssuer } = validClaim;

      expect(() => identityClaim.parse(claimWithoutIssuer)).toThrow();
    });

    it("should reject claim with missing values", () => {
      // WHY: Values array is required even if empty for schema consistency
      const { values: _values, ...claimWithoutValues } = validClaim;

      expect(() => identityClaim.parse(claimWithoutValues)).toThrow();
    });

    it("should reject claim with non-boolean revoked field", () => {
      const claimWithInvalidRevoked = {
        ...validClaim,
        // WHY: Type assertion bypasses TypeScript checks to test runtime validation
        // Using 'as unknown as boolean' creates invalid data that TypeScript
        // would normally reject, allowing us to verify that Zod schema validation
        // catches type mismatches at runtime. This pattern ensures our validation
        // works even when TypeScript safety is circumvented by external data.
        revoked: "false" as unknown as boolean,
      };

      expect(() => identityClaim.parse(claimWithInvalidRevoked)).toThrow();
    });

    it("should reject claim with invalid issuer address", () => {
      const claimWithInvalidIssuer = {
        ...validClaim,
        issuer: {
          id: "invalid-address",
        },
      };

      expect(() => identityClaim.parse(claimWithInvalidIssuer)).toThrow();
    });

    it("should reject claim with invalid values array", () => {
      const claimWithInvalidValues = {
        ...validClaim,
        values: [
          { key: "name" }, // Missing value field
        ],
      };

      expect(() => identityClaim.parse(claimWithInvalidValues)).toThrow();
    });
  });
});

describe("isIdentityClaim", () => {
  const validClaim = {
    id: "0x123abc-42",
    name: "KYC Verification",
    revoked: false,
    issuer: {
      id: "0x71c7656ec7ab88b098defb751b7401b5f6d8976f",
    },
    values: [{ key: "name", value: "John Doe" }],
  };

  it("should return true for valid claim", () => {
    expect(isIdentityClaim(validClaim)).toBe(true);
  });

  it("should return false for invalid claim", () => {
    expect(isIdentityClaim("not-a-claim")).toBe(false);
    expect(isIdentityClaim({})).toBe(false);
    expect(isIdentityClaim(null)).toBe(false);
  });
});

describe("parseIdentityClaim", () => {
  const validClaim = {
    id: "0x123abc-42",
    name: "KYC Verification",
    revoked: false,
    issuer: {
      id: "0x71c7656ec7ab88b098defb751b7401b5f6d8976f",
    },
    values: [{ key: "name", value: "John Doe" }],
  };

  it("should parse valid claim", () => {
    const result = parseIdentityClaim(validClaim);
    expect(result).toEqual({
      ...validClaim,
      issuer: {
        id: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F", // Checksummed
      },
    });
  });

  it("should throw for invalid claim", () => {
    expect(() => parseIdentityClaim("not-a-claim")).toThrow();
    expect(() => parseIdentityClaim({})).toThrow();
  });
});
