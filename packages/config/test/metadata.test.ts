import { describe, expect, it } from "bun:test";
import { metadata, seo } from "../src/metadata";

describe("metadata", () => {
  it("should export correct default metadata", () => {
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
    expect(tags).toContainEqual({ name: "og:title", content: metadata.title });
    expect(tags).toContainEqual({
      name: "og:description",
      content: metadata.description,
    });

    // Should not include image tags when no image is provided
    expect(tags).not.toContainEqual({
      name: "twitter:image",
      content: expect.any(String),
    });
    expect(tags).not.toContainEqual({
      name: "twitter:card",
      content: expect.any(String),
    });
    expect(tags).not.toContainEqual({
      name: "og:image",
      content: expect.any(String),
    });
  });

  it("should append custom title to base title", () => {
    const customTitle = "Products";
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
    const customDescription = "Custom page description";
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

  it("should merge custom keywords with default keywords", () => {
    const customKeywords = ["blockchain", "web3", "DeFi"];
    const tags = seo({ keywords: customKeywords });

    const expectedKeywords = [...metadata.keywords, ...customKeywords].join(
      ", "
    );
    expect(tags).toContainEqual({
      name: "keywords",
      content: expectedKeywords,
    });
  });

  it("should handle all parameters together", () => {
    const params = {
      title: "Test Page",
      description: "Test description",
      image: "/test.png",
      keywords: ["test", "example"],
    };

    const tags = seo(params);

    const expectedTitle = `${params.title} | ${metadata.title}`;
    const expectedKeywords = [...metadata.keywords, ...params.keywords].join(
      ", "
    );

    // Check basic meta tags
    expect(tags).toContainEqual({ title: expectedTitle });
    expect(tags).toContainEqual({
      name: "description",
      content: params.description,
    });
    expect(tags).toContainEqual({
      name: "keywords",
      content: expectedKeywords,
    });

    // Check Twitter tags
    expect(tags).toContainEqual({
      name: "twitter:title",
      content: expectedTitle,
    });
    expect(tags).toContainEqual({
      name: "twitter:description",
      content: params.description,
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
      content: params.image,
    });
    expect(tags).toContainEqual({
      name: "twitter:card",
      content: "summary_large_image",
    });

    // Check Open Graph tags
    expect(tags).toContainEqual({ name: "og:type", content: "website" });
    expect(tags).toContainEqual({ name: "og:title", content: expectedTitle });
    expect(tags).toContainEqual({
      name: "og:description",
      content: params.description,
    });
    expect(tags).toContainEqual({ name: "og:image", content: params.image });
  });

  it("should handle undefined parameters gracefully", () => {
    const tags = seo({
      title: undefined,
      description: undefined,
      image: undefined,
      keywords: undefined,
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

    // Should not include image tags
    expect(tags).not.toContainEqual({
      name: "twitter:image",
      content: expect.any(String),
    });
    expect(tags).not.toContainEqual({
      name: "twitter:card",
      content: expect.any(String),
    });
    expect(tags).not.toContainEqual({
      name: "og:image",
      content: expect.any(String),
    });
  });

  it("should use default og image when image parameter is true but empty", () => {
    const tags = seo({ image: "" });

    // Empty string should not trigger image tags
    expect(tags).not.toContainEqual({
      name: "twitter:image",
      content: expect.any(String),
    });
    expect(tags).not.toContainEqual({
      name: "twitter:card",
      content: expect.any(String),
    });
    expect(tags).not.toContainEqual({
      name: "og:image",
      content: expect.any(String),
    });
  });

  it("should handle empty keywords array", () => {
    const tags = seo({ keywords: [] });

    expect(tags).toContainEqual({
      name: "keywords",
      content: metadata.keywords.join(", "),
    });
  });

  it("should handle only title parameter", () => {
    const tags = seo({ title: "Only Title" });

    const expectedTitle = `Only Title | ${metadata.title}`;
    expect(tags).toContainEqual({ title: expectedTitle });
    expect(tags).toContainEqual({
      name: "twitter:title",
      content: expectedTitle,
    });
    expect(tags).toContainEqual({ name: "og:title", content: expectedTitle });

    // Other values should use defaults
    expect(tags).toContainEqual({
      name: "description",
      content: metadata.description,
    });
    expect(tags).toContainEqual({
      name: "keywords",
      content: metadata.keywords.join(", "),
    });
  });

  it("should handle only description parameter", () => {
    const tags = seo({ description: "Only Description" });

    expect(tags).toContainEqual({
      name: "description",
      content: "Only Description",
    });
    expect(tags).toContainEqual({
      name: "twitter:description",
      content: "Only Description",
    });
    expect(tags).toContainEqual({
      name: "og:description",
      content: "Only Description",
    });

    // Title should use default
    expect(tags).toContainEqual({ title: metadata.title });
  });

  it("should handle only keywords parameter", () => {
    const customKeywords = ["keyword1", "keyword2"];
    const tags = seo({ keywords: customKeywords });

    const expectedKeywords = [...metadata.keywords, ...customKeywords].join(
      ", "
    );
    expect(tags).toContainEqual({
      name: "keywords",
      content: expectedKeywords,
    });

    // Other values should use defaults
    expect(tags).toContainEqual({ title: metadata.title });
    expect(tags).toContainEqual({
      name: "description",
      content: metadata.description,
    });
  });

  it("should generate correct number of tags without image", () => {
    const tags = seo({});

    // Should have 10 tags when no image is provided
    expect(tags).toHaveLength(10);
  });

  it("should generate correct number of tags with image", () => {
    const tags = seo({ image: "/test.png" });

    // Should have 13 tags when image is provided (10 base + 3 image tags)
    expect(tags).toHaveLength(13);
  });
});
