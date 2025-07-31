import { describe, expect, it } from "vitest";
import { z } from "zod";
import {
  isRequiredFieldForZodDiscriminatedUnion,
  isRequiredFieldForZodIntersection,
  isRequiredFieldForZodObject,
} from "./schema-field";

describe("schema-field utilities", () => {
  describe("isRequiredFieldForZodObject", () => {
    const schema = z.object({
      requiredName: z.string(),
      requiredAge: z.number(),
      optionalEmail: z.string().optional(),
      optionalPhone: z.string().nullable(),
      nullishAddress: z.string().nullish(),
      nullablePhone: z.string().nullable(),
    });
    it("should return true for required fields in a ZodObject", () => {
      expect(isRequiredFieldForZodObject(schema, "requiredName")).toBe(true);
      expect(isRequiredFieldForZodObject(schema, "requiredAge")).toBe(true);
    });

    it("should return false for optional fields in a ZodObject", () => {
      expect(isRequiredFieldForZodObject(schema, "optionalEmail")).toBe(false);
      expect(isRequiredFieldForZodObject(schema, "optionalPhone")).toBe(true);
      expect(isRequiredFieldForZodObject(schema, "nullishAddress")).toBe(false); // nullish accepts undefined
      expect(isRequiredFieldForZodObject(schema, "nullablePhone")).toBe(true); // nullable is still required, just accepts null
    });

    it("should return false for non-existent fields", () => {
      // @ts-expect-error - non-existent field
      expect(isRequiredFieldForZodObject(schema, "nonExistentField")).toBe(
        false
      );
    });
  });

  describe("isRequiredFieldForZodIntersection", () => {
    it("should check fields from both sides of an intersection", () => {
      const leftSchema = z.object({
        requiredName: z.string(),
        optionalAge: z.number().optional(),
      });

      const rightSchema = z.object({
        requiredEmail: z.string(),
        optionalPhone: z.string().optional(),
      });

      const intersectionSchema = leftSchema.and(rightSchema);

      expect(
        isRequiredFieldForZodIntersection(intersectionSchema, "requiredName")
      ).toBe(true);
      expect(
        isRequiredFieldForZodIntersection(intersectionSchema, "requiredEmail")
      ).toBe(true);
      expect(
        isRequiredFieldForZodIntersection(intersectionSchema, "optionalAge")
      ).toBe(false);
      expect(
        isRequiredFieldForZodIntersection(intersectionSchema, "optionalPhone")
      ).toBe(false);
    });

    it("should handle nested intersections correctly", () => {
      const baseSchema = z.object({
        requiredId: z.string(),
        requiredCreatedAt: z.date(),
      });

      const detailSchema = z.object({
        requiredTitle: z.string(),
        optionalDescription: z.string().optional(),
      });

      const metaSchema = z.object({
        requiredTags: z.array(z.string()),
        optionalPriority: z.number().optional(),
      });

      const finalSchema = baseSchema.and(detailSchema).and(metaSchema);

      expect(isRequiredFieldForZodIntersection(finalSchema, "requiredId")).toBe(
        true
      );
      expect(
        isRequiredFieldForZodIntersection(finalSchema, "requiredTitle")
      ).toBe(true);
      expect(
        isRequiredFieldForZodIntersection(finalSchema, "requiredTags")
      ).toBe(true);
      expect(
        isRequiredFieldForZodIntersection(finalSchema, "optionalDescription")
      ).toBe(false);
      expect(
        isRequiredFieldForZodIntersection(finalSchema, "optionalPriority")
      ).toBe(false);
    });
  });

  describe("isRequiredFieldForZodDiscriminatedUnion", () => {
    it("should check if field is required in any option of discriminated union", () => {
      const depositSchema = z.object({
        type: z.literal("deposit"),
        requiredName: z.string(),
        requiredSymbol: z.string(),
        requiredDecimals: z.number(),
        optionalInterestRate: z.number().optional(),
      });

      const bondSchema = z.object({
        type: z.literal("bond"),
        requiredName: z.string(),
        requiredSymbol: z.string(),
        requiredDecimals: z.number(),
        requiredMaturityDate: z.string(),
        requiredFaceValue: z.string(),
        optionalIsin: z.string().optional(),
      });

      const equitySchema = z.object({
        type: z.literal("equity"),
        requiredName: z.string(),
        requiredSymbol: z.string(),
        requiredDecimals: z.number(),
        optionalDividendRate: z.number().optional(),
        requiredVotingRights: z.boolean(),
      });

      const unionSchema = z.discriminatedUnion("type", [
        depositSchema,
        bondSchema,
        equitySchema,
      ]);

      // Common required fields
      expect(
        isRequiredFieldForZodDiscriminatedUnion(unionSchema, "requiredName")
      ).toBe(true);
      expect(
        isRequiredFieldForZodDiscriminatedUnion(unionSchema, "requiredSymbol")
      ).toBe(true);
      expect(
        isRequiredFieldForZodDiscriminatedUnion(unionSchema, "requiredDecimals")
      ).toBe(true);

      // Type-specific required fields
      expect(
        isRequiredFieldForZodDiscriminatedUnion(
          unionSchema,
          "requiredMaturityDate"
        )
      ).toBe(true);
      expect(
        isRequiredFieldForZodDiscriminatedUnion(
          unionSchema,
          "requiredFaceValue"
        )
      ).toBe(true);
      expect(
        isRequiredFieldForZodDiscriminatedUnion(
          unionSchema,
          "requiredVotingRights"
        )
      ).toBe(true);

      // Optional fields
      expect(
        isRequiredFieldForZodDiscriminatedUnion(
          unionSchema,
          "optionalInterestRate"
        )
      ).toBe(false);
      expect(
        isRequiredFieldForZodDiscriminatedUnion(unionSchema, "optionalIsin")
      ).toBe(false);
      expect(
        isRequiredFieldForZodDiscriminatedUnion(
          unionSchema,
          "optionalDividendRate"
        )
      ).toBe(false);
    });

    it("should handle discriminated unions with complex schemas", () => {
      const baseSchema = z.object({
        requiredId: z.string(),
        requiredVersion: z.number(),
      });

      const adminUser = baseSchema.extend({
        type: z.literal("admin"),
        requiredPermissions: z.array(z.string()),
        requiredAdminLevel: z.number(),
      });

      const regularUser = baseSchema.extend({
        type: z.literal("regular"),
        optionalSubscription: z.string().optional(),
        optionalCredits: z.number().optional(),
      });

      const guestUser = baseSchema.extend({
        type: z.literal("guest"),
        requiredSessionExpiry: z.date(),
        optionalTempId: z.string().optional(),
      });

      const userUnion = z.discriminatedUnion("type", [
        adminUser,
        regularUser,
        guestUser,
      ]);

      // Common required fields from base
      expect(
        isRequiredFieldForZodDiscriminatedUnion(userUnion, "requiredId")
      ).toBe(true);
      expect(
        isRequiredFieldForZodDiscriminatedUnion(userUnion, "requiredVersion")
      ).toBe(true);

      // Type-specific required fields
      expect(
        isRequiredFieldForZodDiscriminatedUnion(
          userUnion,
          "requiredPermissions"
        )
      ).toBe(true);
      expect(
        isRequiredFieldForZodDiscriminatedUnion(userUnion, "requiredAdminLevel")
      ).toBe(true);
      expect(
        isRequiredFieldForZodDiscriminatedUnion(
          userUnion,
          "requiredSessionExpiry"
        )
      ).toBe(true);

      // Optional fields
      expect(
        isRequiredFieldForZodDiscriminatedUnion(
          userUnion,
          "optionalSubscription"
        )
      ).toBe(false);
      expect(
        isRequiredFieldForZodDiscriminatedUnion(userUnion, "optionalCredits")
      ).toBe(false);
      expect(
        isRequiredFieldForZodDiscriminatedUnion(userUnion, "optionalTempId")
      ).toBe(false);
    });
  });

  describe("Intersection of ZodObject and ZodDiscriminatedUnion", () => {
    it("should handle intersection of object and discriminated union", () => {
      // Base configuration that all entities must have
      const configSchema = z.object({
        requiredId: z.string(),
        optionalUpdatedAt: z.date().optional(),
      });

      // Product variants as discriminated union
      const physicalProduct = z.object({
        productType: z.literal("physical"),
        requiredName: z.string(),
        requiredWeight: z.number(),
        optionalStock: z.number().optional(),
      });

      const digitalProduct = z.object({
        productType: z.literal("digital"),
        requiredName: z.string(),
        requiredDownloadUrl: z.string(),
        optionalLicenseKey: z.string().optional(),
      });

      const productUnion = z.discriminatedUnion("productType", [
        physicalProduct,
        digitalProduct,
      ]);

      // Intersection of config and product union
      const completeProductSchema = configSchema.and(productUnion);

      // Test fields from the object part
      expect(
        isRequiredFieldForZodIntersection(completeProductSchema, "requiredId")
      ).toBe(true);
      expect(
        isRequiredFieldForZodIntersection(
          completeProductSchema,
          "optionalUpdatedAt"
        )
      ).toBe(false);

      // Test common fields from the union
      expect(
        isRequiredFieldForZodIntersection(completeProductSchema, "requiredName")
      ).toBe(true);

      // Test type-specific required fields
      expect(
        isRequiredFieldForZodIntersection(
          completeProductSchema,
          "requiredWeight"
        )
      ).toBe(true); // Required in physical
      expect(
        isRequiredFieldForZodIntersection(
          completeProductSchema,
          "requiredDownloadUrl"
        )
      ).toBe(true); // Required in digital

      // Test optional fields
      expect(
        isRequiredFieldForZodIntersection(
          completeProductSchema,
          "optionalStock"
        )
      ).toBe(false); // Optional in physical
      expect(
        isRequiredFieldForZodIntersection(
          completeProductSchema,
          "optionalLicenseKey"
        )
      ).toBe(false); // Optional in digital
    });

    it("should handle complex nested intersection with discriminated union", () => {
      // Base user info
      const userSchema = z.object({
        requiredUserId: z.string(),
      });

      const themeSchema = z.object({
        requiredTheme: z.string(),
      });

      const userProfileSchema = userSchema.and(themeSchema);

      // Payment method as discriminated union
      const creditCardPayment = z.object({
        paymentType: z.literal("creditCard"),
        requiredUserProfile: userProfileSchema,
        requiredCardNumber: z.string(),
        optionalSaveCard: z.boolean().optional(),
      });

      const cryptoPayment = z.object({
        paymentType: z.literal("crypto"),
        requiredUserProfile: userProfileSchema,
        requiredWalletAddress: z.string(),
        optionalNetwork: z.string().optional(),
      });

      const paymentMethodUnion = z.discriminatedUnion("paymentType", [
        creditCardPayment,
        cryptoPayment,
      ]);

      // Test fields from the object part
      expect(
        isRequiredFieldForZodDiscriminatedUnion(
          paymentMethodUnion,
          "requiredUserProfile"
        )
      ).toBe(true);

      // Test union required fields
      expect(
        isRequiredFieldForZodDiscriminatedUnion(
          paymentMethodUnion,
          "requiredCardNumber"
        )
      ).toBe(true); // Required in creditCard
      expect(
        isRequiredFieldForZodDiscriminatedUnion(
          paymentMethodUnion,
          "requiredWalletAddress"
        )
      ).toBe(true); // Required in crypto

      // Test union optional fields
      expect(
        isRequiredFieldForZodDiscriminatedUnion(
          paymentMethodUnion,
          "optionalSaveCard"
        )
      ).toBe(false); // Optional in creditCard
      expect(
        isRequiredFieldForZodDiscriminatedUnion(
          paymentMethodUnion,
          "optionalNetwork"
        )
      ).toBe(false); // Optional in crypto
    });
  });
});
