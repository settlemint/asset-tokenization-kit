import { readFileSync } from "node:fs";

const files = [
  "/Users/roderik/Development/asset-tokenization-kit/kit/dapp/content/docs/architecture/api-layer.mdx",
  "/Users/roderik/Development/asset-tokenization-kit/kit/dapp/content/docs/architecture/application/asset-management-ux.mdx",
  "/Users/roderik/Development/asset-tokenization-kit/kit/dapp/content/docs/architecture/application/backend-api.mdx",
  "/Users/roderik/Development/asset-tokenization-kit/kit/dapp/content/docs/architecture/application/frontend-architecture.mdx",
  "/Users/roderik/Development/asset-tokenization-kit/kit/dapp/content/docs/architecture/blockchain-layer.mdx",
  "/Users/roderik/Development/asset-tokenization-kit/kit/dapp/content/docs/architecture/core-components.mdx",
  "/Users/roderik/Development/asset-tokenization-kit/kit/dapp/content/docs/architecture/data-indexing/blockchain-indexing.mdx",
  "/Users/roderik/Development/asset-tokenization-kit/kit/dapp/content/docs/architecture/data-indexing/database-model.mdx",
  "/Users/roderik/Development/asset-tokenization-kit/kit/dapp/content/docs/architecture/data-layer.mdx",
  "/Users/roderik/Development/asset-tokenization-kit/kit/dapp/content/docs/architecture/deployment-layer.mdx",
  "/Users/roderik/Development/asset-tokenization-kit/kit/dapp/content/docs/architecture/frontend-layer.mdx",
  "/Users/roderik/Development/asset-tokenization-kit/kit/dapp/content/docs/architecture/integration-operations/deployment-operations.mdx",
  "/Users/roderik/Development/asset-tokenization-kit/kit/dapp/content/docs/architecture/integration-operations/external-integrations.mdx",
  "/Users/roderik/Development/asset-tokenization-kit/kit/dapp/content/docs/architecture/integration-operations/integration-playbook.mdx",
  "/Users/roderik/Development/asset-tokenization-kit/kit/dapp/content/docs/architecture/performance/frontend-api-optimization.mdx",
  "/Users/roderik/Development/asset-tokenization-kit/kit/dapp/content/docs/architecture/performance/infrastructure-performance.mdx",
  "/Users/roderik/Development/asset-tokenization-kit/kit/dapp/content/docs/architecture/performance/performance-operations.mdx",
  "/Users/roderik/Development/asset-tokenization-kit/kit/dapp/content/docs/architecture/performance/scalability-architecture.mdx",
  "/Users/roderik/Development/asset-tokenization-kit/kit/dapp/content/docs/architecture/quality/compliance-certification.mdx",
  "/Users/roderik/Development/asset-tokenization-kit/kit/dapp/content/docs/architecture/quality/identity-compliance-control-plane.mdx",
  "/Users/roderik/Development/asset-tokenization-kit/kit/dapp/content/docs/architecture/quality/observability-disaster-recovery.mdx",
  "/Users/roderik/Development/asset-tokenization-kit/kit/dapp/content/docs/architecture/quality/security-validation.mdx",
  "/Users/roderik/Development/asset-tokenization-kit/kit/dapp/content/docs/architecture/quality/testing-quality.mdx",
  "/Users/roderik/Development/asset-tokenization-kit/kit/dapp/content/docs/architecture/smart-contracts/addon-modules.mdx",
  "/Users/roderik/Development/asset-tokenization-kit/kit/dapp/content/docs/architecture/smart-contracts/asset-contracts.mdx",
  "/Users/roderik/Development/asset-tokenization-kit/kit/dapp/content/docs/architecture/smart-contracts/factory-upgradeability.mdx",
  "/Users/roderik/Development/asset-tokenization-kit/kit/dapp/content/docs/architecture/smart-contracts/identity-compliance.mdx",
  "/Users/roderik/Development/asset-tokenization-kit/kit/dapp/content/docs/architecture/smart-contracts/smart-protocol.mdx",
  "/Users/roderik/Development/asset-tokenization-kit/kit/dapp/content/docs/architecture/system-architecture.mdx",
  "/Users/roderik/Development/asset-tokenization-kit/kit/dapp/content/docs/developer-guides/api-integration/api-reference.mdx",
  "/Users/roderik/Development/asset-tokenization-kit/kit/dapp/content/docs/developer-guides/api-integration/using-api.mdx",
  "/Users/roderik/Development/asset-tokenization-kit/kit/dapp/content/docs/developer-guides/architecture.mdx",
  "/Users/roderik/Development/asset-tokenization-kit/kit/dapp/content/docs/developer-guides/data-model/data-model-reference.mdx",
  "/Users/roderik/Development/asset-tokenization-kit/kit/dapp/content/docs/developer-guides/data-model/entity-compliance.mdx",
  "/Users/roderik/Development/asset-tokenization-kit/kit/dapp/content/docs/developer-guides/data-model/entity-corporate-actions.mdx",
  "/Users/roderik/Development/asset-tokenization-kit/kit/dapp/content/docs/developer-guides/data-model/entity-investor.mdx",
  "/Users/roderik/Development/asset-tokenization-kit/kit/dapp/content/docs/developer-guides/data-model/entity-token.mdx",
  "/Users/roderik/Development/asset-tokenization-kit/kit/dapp/content/docs/developer-guides/data-model/index.mdx",
  "/Users/roderik/Development/asset-tokenization-kit/kit/dapp/content/docs/developer-guides/deployment-ops/installation-configuration.mdx",
  "/Users/roderik/Development/asset-tokenization-kit/kit/dapp/content/docs/developer-guides/deployment-ops/observability-monitoring.mdx",
  "/Users/roderik/Development/asset-tokenization-kit/kit/dapp/content/docs/developer-guides/deployment-ops/production-operations.mdx",
  "/Users/roderik/Development/asset-tokenization-kit/kit/dapp/content/docs/developer-guides/quality-assurance.mdx",
  "/Users/roderik/Development/asset-tokenization-kit/kit/dapp/content/docs/developer-guides/reference.mdx",
  "/Users/roderik/Development/asset-tokenization-kit/kit/dapp/content/docs/developer-guides/setup.mdx",
  "/Users/roderik/Development/asset-tokenization-kit/kit/dapp/content/docs/developer-guides/smart-contracts/contract-reference.mdx",
  "/Users/roderik/Development/asset-tokenization-kit/kit/dapp/content/docs/developer-guides/smart-contracts/extending-contracts.mdx",
  "/Users/roderik/Development/asset-tokenization-kit/kit/dapp/content/docs/executive-overview/atk-overview.mdx",
  "/Users/roderik/Development/asset-tokenization-kit/kit/dapp/content/docs/executive-overview/compliance-security.mdx",
  "/Users/roderik/Development/asset-tokenization-kit/kit/dapp/content/docs/executive-overview/dalp-solution.mdx",
  "/Users/roderik/Development/asset-tokenization-kit/kit/dapp/content/docs/executive-overview/glossary.mdx",
  "/Users/roderik/Development/asset-tokenization-kit/kit/dapp/content/docs/executive-overview/introduction.mdx",
  "/Users/roderik/Development/asset-tokenization-kit/kit/dapp/content/docs/executive-overview/market-challenges.mdx",
  "/Users/roderik/Development/asset-tokenization-kit/kit/dapp/content/docs/executive-overview/use-cases/corporate-bonds.mdx",
  "/Users/roderik/Development/asset-tokenization-kit/kit/dapp/content/docs/executive-overview/use-cases/deposits.mdx",
  "/Users/roderik/Development/asset-tokenization-kit/kit/dapp/content/docs/executive-overview/use-cases/index.mdx",
  "/Users/roderik/Development/asset-tokenization-kit/kit/dapp/content/docs/executive-overview/use-cases/private-equity.mdx",
  "/Users/roderik/Development/asset-tokenization-kit/kit/dapp/content/docs/executive-overview/use-cases/real-estate.mdx",
  "/Users/roderik/Development/asset-tokenization-kit/kit/dapp/content/docs/executive-overview/use-cases/stablecoins.mdx",
  "/Users/roderik/Development/asset-tokenization-kit/kit/dapp/content/docs/index.mdx",
  "/Users/roderik/Development/asset-tokenization-kit/kit/dapp/content/docs/user-guides/asset-issuance/corporate-actions.mdx",
  "/Users/roderik/Development/asset-tokenization-kit/kit/dapp/content/docs/user-guides/asset-issuance/issue-bond.mdx",
  "/Users/roderik/Development/asset-tokenization-kit/kit/dapp/content/docs/user-guides/asset-issuance/issue-deposit.mdx",
  "/Users/roderik/Development/asset-tokenization-kit/kit/dapp/content/docs/user-guides/asset-issuance/issue-equity.mdx",
  "/Users/roderik/Development/asset-tokenization-kit/kit/dapp/content/docs/user-guides/asset-issuance/issue-fund.mdx",
  "/Users/roderik/Development/asset-tokenization-kit/kit/dapp/content/docs/user-guides/asset-issuance/issue-stablecoin.mdx",
  "/Users/roderik/Development/asset-tokenization-kit/kit/dapp/content/docs/user-guides/getting-started.mdx",
  "/Users/roderik/Development/asset-tokenization-kit/kit/dapp/content/docs/user-guides/operations/admin-settings.mdx",
  "/Users/roderik/Development/asset-tokenization-kit/kit/dapp/content/docs/user-guides/operations/compliance-configuration.mdx",
  "/Users/roderik/Development/asset-tokenization-kit/kit/dapp/content/docs/user-guides/operations/fiat-bridge.mdx",
  "/Users/roderik/Development/asset-tokenization-kit/kit/dapp/content/docs/user-guides/operations/manage-investors.mdx",
  "/Users/roderik/Development/asset-tokenization-kit/kit/dapp/content/docs/user-guides/troubleshooting/assets.mdx",
  "/Users/roderik/Development/asset-tokenization-kit/kit/dapp/content/docs/user-guides/troubleshooting/compliance.mdx",
  "/Users/roderik/Development/asset-tokenization-kit/kit/dapp/content/docs/user-guides/troubleshooting/index.mdx",
  "/Users/roderik/Development/asset-tokenization-kit/kit/dapp/content/docs/user-guides/troubleshooting/transactions.mdx",
  "/Users/roderik/Development/asset-tokenization-kit/kit/dapp/content/docs/user-guides/troubleshooting/wallet.mdx",
];

function extractContent(filePath: string) {
  const content = readFileSync(filePath, "utf-8");

  // Extract frontmatter
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  let description = "[NO DESCRIPTION FIELD]";

  if (frontmatterMatch?.[1]) {
    const frontmatter = frontmatterMatch[1];
    const descMatch = frontmatter.match(/description:\s*["']?(.*?)["']?\n/);
    if (descMatch?.[1]) {
      description = descMatch[1].trim();
    }
  }

  // Extract body content after frontmatter
  const bodyContent = content.replace(/^---\n[\s\S]*?\n---\n/, "").trim();

  // Extract first paragraph (before first ## heading)
  const firstHeadingIndex = bodyContent.search(/^##\s/m);
  let textBeforeHeading =
    firstHeadingIndex > 0
      ? bodyContent.substring(0, firstHeadingIndex).trim()
      : bodyContent;

  // Extract first non-empty paragraph
  const paragraphs = textBeforeHeading.split(/\n\n+/).filter((p) => p.trim());
  const firstPara =
    paragraphs[0]?.trim().replace(/\n/g, " ") || "[NO FIRST PARAGRAPH]";

  // Shorten path for display
  const shortPath = filePath.replace(
    "/Users/roderik/Development/asset-tokenization-kit/kit/dapp/content/docs/",
    ""
  );

  return {
    path: shortPath,
    description,
    firstPara,
  };
}

for (const file of files) {
  const result = extractContent(file);
  console.log(`FILE: ${result.path}`);
  console.log(`CURRENT DESC: ${result.description}`);
  console.log(`FIRST PARA: ${result.firstPara}`);
  console.log("---\n");
}
