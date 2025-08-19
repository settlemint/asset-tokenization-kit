import { describe, expect, it } from "bun:test";
import { metadata, seo } from "../src/metadata";

describe("metadata", () => {
  it("should export correct default metadata values", () => {
    expect(metadata.title).toBe("Asset Tokenization Kit | SettleMint");
    expect(metadata.description).toBe("SettleMint");
    expect(metadata.twitter).toBe("@settlemintcom");
    expect(metadata.og).toBe("/og.png");
    expect(metadata.keywords).toEqual([
      "Asset Tokenization",
      "SettleMint",
      "Tokenization",
      "Asset Tokenization Kit",
      "Digital Assets",
      "SMART protocol",
      "ERC-3643",
      "Bonds",
      "Stablecoins",
      "Funds",
      "Deposits",
      "Equity",
    ]);
  });

  describe("seo", () => {
    it("should return default meta tags when no parameters are provided", () => {
      const tags = seo({});

      expect(tags).toContainEqual({ title: metadata.title });
      expect(tags).toContainEqual({
        name: "description",
        content: metadata.description,
      });
      expect(tags).toContainEqual({
        name: "keywords",
        content: metadata.keywords.join(", "),
      });
      expect(tags).toContainEqual({
        name: "twitter:title",
        content: metadata.title,
      });
      expect(tags).toContainEqual({
        name: "twitter:description",
        content: metadata.description,
      });
      expect(tags).toContainEqual({
        name: "twitter:creator",
        content: metadata.twitter,
      });
      expect(tags).toContainEqual({
        name: "twitter:site",
        content: metadata.twitter,
      });
      expect(tags).toContainEqual({ name: "og:type", content: "website" });
      expect(tags).toContainEqual({
        name: "og:title",
        content: metadata.title,
      });
      expect(tags).toContainEqual({
        name: "og:description",
        content: metadata.description,
      });
    });

    it("should append custom title to default title", () => {
      const customTitle = "Custom Page";
      const tags = seo({ title: customTitle });

      const expectedTitle = `${customTitle} | ${metadata.title}`;
      expect(tags).toContainEqual({ title: expectedTitle });
      expect(tags).toContainEqual({
        name: "twitter:title",
        content: expectedTitle,
      });
      expect(tags).toContainEqual({ name: "og:title", content: expectedTitle });
    });

    it("should use custom description when provided", () => {
      const customDescription = "This is a custom description";
      const tags = seo({ description: customDescription });

      expect(tags).toContainEqual({
        name: "description",
        content: customDescription,
      });
      expect(tags).toContainEqual({
        name: "twitter:description",
        content: customDescription,
      });
      expect(tags).toContainEqual({
        name: "og:description",
        content: customDescription,
      });
    });

    it("should merge custom keywords with default keywords", () => {
      const customKeywords = ["blockchain", "web3", "defi"];
      const tags = seo({ keywords: customKeywords });

      const expectedKeywords = [...metadata.keywords, ...customKeywords].join(
        ", ",
      );
      expect(tags).toContainEqual({
        name: "keywords",
        content: expectedKeywords,
      });
    });

    it("should include image meta tags when image is provided", () => {
      const customImage = "/custom-image.png";
      const tags = seo({ image: customImage });

      expect(tags).toContainEqual({
        name: "twitter:image",
        content: customImage,
      });
      expect(tags).toContainEqual({
        name: "twitter:card",
        content: "summary_large_image",
      });
      expect(tags).toContainEqual({ name: "og:image", content: customImage });
    });

    it("should not include image meta tags when image is not provided", () => {
      const tags = seo({});

      const imageTags = tags.filter(
        (tag) =>
          tag.name === "twitter:image" ||
          tag.name === "twitter:card" ||
          tag.name === "og:image",
      );
      expect(imageTags).toHaveLength(0);
    });

    it("should handle all parameters combined", () => {
      const customTitle = "Products";
      const customDescription = "Browse our tokenized products";
      const customKeywords = ["products", "browse", "catalog"];
      const customImage = "/products.png";

      const tags = seo({
        title: customTitle,
        description: customDescription,
        keywords: customKeywords,
        image: customImage,
      });

      const expectedTitle = `${customTitle} | ${metadata.title}`;
      const expectedKeywords = [...metadata.keywords, ...customKeywords].join(
        ", ",
      );

      // Check all tags are present with correct values
      expect(tags).toContainEqual({ title: expectedTitle });
      expect(tags).toContainEqual({
        name: "description",
        content: customDescription,
      });
      expect(tags).toContainEqual({
        name: "keywords",
        content: expectedKeywords,
      });
      expect(tags).toContainEqual({
        name: "twitter:title",
        content: expectedTitle,
      });
      expect(tags).toContainEqual({
        name: "twitter:description",
        content: customDescription,
      });
      expect(tags).toContainEqual({
        name: "twitter:creator",
        content: metadata.twitter,
      });
      expect(tags).toContainEqual({
        name: "twitter:site",
        content: metadata.twitter,
      });
      expect(tags).toContainEqual({
        name: "twitter:image",
        content: customImage,
      });
      expect(tags).toContainEqual({
        name: "twitter:card",
        content: "summary_large_image",
      });
      expect(tags).toContainEqual({ name: "og:type", content: "website" });
      expect(tags).toContainEqual({ name: "og:title", content: expectedTitle });
      expect(tags).toContainEqual({
        name: "og:description",
        content: customDescription,
      });
      expect(tags).toContainEqual({ name: "og:image", content: customImage });
    });

    it("should handle undefined values gracefully", () => {
      const tags = seo({
        title: undefined,
        description: undefined,
        keywords: undefined,
        image: undefined,
      });

      expect(tags).toContainEqual({ title: metadata.title });
      expect(tags).toContainEqual({
        name: "description",
        content: metadata.description,
      });
      expect(tags).toContainEqual({
        name: "keywords",
        content: metadata.keywords.join(", "),
      });
    });

    it("should handle empty strings", () => {
      const tags = seo({
        title: "",
        description: "",
        keywords: [],
        image: "",
      });

      // Empty title should use default
      expect(tags).toContainEqual({ title: metadata.title });
      // Empty description should not fall back (it's explicitly empty)
      expect(tags).toContainEqual({ name: "description", content: "" });
      // Empty keywords array should still include defaults
      expect(tags).toContainEqual({
        name: "keywords",
        content: metadata.keywords.join(", "),
      });
      // Empty image should not include image tags
      const imageTags = tags.filter(
        (tag) =>
          tag.name === "twitter:image" ||
          tag.name === "twitter:card" ||
          tag.name === "og:image",
      );
      expect(imageTags).toHaveLength(0);
    });

    it("should maintain correct tag structure", () => {
      const tags = seo({ title: "Test" });

      // Verify each tag has correct structure
      for (const tag of tags) {
        if (tag.title) {
          expect(typeof tag.title).toBe("string");
          expect(tag.name).toBeUndefined();
          expect(tag.content).toBeUndefined();
        } else {
          expect(typeof tag.name).toBe("string");
          expect(typeof tag.content).toBe("string");
          expect(tag.title).toBeUndefined();
        }
      }
    });

    it("should return consistent number of tags based on image presence", () => {
      const tagsWithoutImage = seo({});
      const tagsWithImage = seo({ image: "/test.png" });

      // Without image: 10 tags (1 title + 9 meta tags)
      expect(tagsWithoutImage).toHaveLength(10);
      // With image: 13 tags (10 base + 3 image-related)
      expect(tagsWithImage).toHaveLength(13);
    });

    it("should preserve special characters in content", () => {
      const specialChars = "Test & <Special> \"Characters\" 'Here'";
      const tags = seo({
        title: specialChars,
        description: specialChars,
      });

      const expectedTitle = `${specialChars} | ${metadata.title}`;
      expect(tags).toContainEqual({ title: expectedTitle });
      expect(tags).toContainEqual({
        name: "description",
        content: specialChars,
      });
    });

    it("should handle very long keyword lists", () => {
      const longKeywordList = Array.from(
        { length: 50 },
        (_, i) => `keyword${i}`,
      );
      const tags = seo({ keywords: longKeywordList });

      const expectedKeywords = [...metadata.keywords, ...longKeywordList].join(
        ", ",
      );
      expect(tags).toContainEqual({
        name: "keywords",
        content: expectedKeywords,
      });
    });

    it("should use fallback correctly for image with falsy values", () => {
      // Test with null (simulated as undefined in parameters)
      const tagsWithUndefined = seo({ image: undefined });
      const imageTagsUndefined = tagsWithUndefined.filter(
        (tag) =>
          tag.name === "twitter:image" ||
          tag.name === "twitter:card" ||
          tag.name === "og:image",
      );
      expect(imageTagsUndefined).toHaveLength(0);

      // Test with actual value
      const tagsWithValue = seo({ image: "/actual.png" });
      expect(tagsWithValue).toContainEqual({
        name: "og:image",
        content: "/actual.png",
      });
    });
  });
});
