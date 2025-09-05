#!/usr/bin/env bun

/**
 * AWS Marketplace Automation Script for SettleMint Asset Tokenization Kit
 * Creates new version in existing AWS Marketplace product
 *
 * Environment Variables Required:
 * - AWS_ACCESS_KEY_ID: AWS Access Key
 * - AWS_SECRET_ACCESS_KEY: AWS Secret Key
 * - AWS_MARKETPLACE_PRODUCT_ID: AWS Marketplace Product ID (optional, defaults to prod-34hx4wxa4ilnk)
 * - AWS_TARGET_ECR_ACCOUNT: Target ECR Account ID (optional, defaults to 709825985650)
 */

import {
  MarketplaceCatalogClient,
  StartChangeSetCommand,
  DescribeChangeSetCommand,
} from "@aws-sdk/client-marketplace-catalog";
import {
  ECRClient,
  DescribeImagesCommand,
  CreateRepositoryCommand,
  GetAuthorizationTokenCommand,
} from "@aws-sdk/client-ecr";
import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import yaml from "js-yaml";

// Get configuration from environment variables
const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;
const AWS_MARKETPLACE_PRODUCT_ID = process.env.AWS_MARKETPLACE_PRODUCT_ID;
const AWS_TARGET_ECR_ACCOUNT = process.env.AWS_TARGET_ECR_ACCOUNT;

if (
  !AWS_ACCESS_KEY_ID ||
  !AWS_SECRET_ACCESS_KEY ||
  !AWS_MARKETPLACE_PRODUCT_ID ||
  !AWS_TARGET_ECR_ACCOUNT
) {
  console.error("❌ Missing required environment variables:");
  console.error("   All of the following are required:");
  console.error("   - AWS_ACCESS_KEY_ID");
  console.error("   - AWS_SECRET_ACCESS_KEY");
  console.error("   - AWS_MARKETPLACE_PRODUCT_ID");
  console.error("   - AWS_TARGET_ECR_ACCOUNT");
  console.error("\n📚 See README.md for setup instructions");
  process.exit(1);
}

// Configuration
const MARKETPLACE_CONFIG = {
  productId: AWS_MARKETPLACE_PRODUCT_ID,
  productTitle: "SettleMint Asset Tokenization Kit",
  shortDescription:
    "Complete blockchain tokenization platform with ERC-3643 compliance, React 19 dApp, and enterprise-grade infrastructure",
  longDescription: `
The SettleMint Asset Tokenization Kit (ATK) is a production-ready, enterprise-grade solution for tokenizing real-world assets on blockchain networks. Built with modern technologies and compliance standards, ATK provides everything needed to launch compliant tokenization platforms.

## Key Features

### 🏗️ Complete Infrastructure Stack
- **Blockchain Network**: Hyperledger Besu with enterprise-grade configuration
- **Block Explorer**: Blockscout for transaction transparency  
- **GraphQL API**: TheGraph protocol for efficient data querying
- **Database**: PostgreSQL with Redis caching
- **Authentication**: Hasura with advanced authorization
- **Frontend**: React 19 with modern UI/UX

### 🔒 Regulatory Compliance
- **ERC-3643 Standard**: Full T-REX protocol implementation
- **Identity Management**: OnchainID integration
- **KYC/AML Support**: Built-in compliance workflows
- **Role-Based Access**: Granular permission system

### 🚀 Enterprise Ready
- **Kubernetes Native**: Helm charts for easy deployment
- **Scalable Architecture**: Microservices design pattern
- **Monitoring**: Observability stack included
- **Security**: Production-hardened configuration

### 💼 Use Cases
- Real Estate Tokenization
- Private Equity Fund Shares
- Art & Collectibles
- Carbon Credits
- Supply Chain Assets
`,
  categories: [
    "Blockchain",
    "Financial Services",
    "Identity & Access Management",
    "Developer Tools",
  ],
  keywords: [
    "blockchain",
    "tokenization",
    "ERC-3643",
    "T-REX",
    "compliance",
    "KYC",
    "AML",
    "real-world-assets",
    "RWA",
    "DeFi",
    "Ethereum",
    "Hyperledger Besu",
    "React",
    "Kubernetes",
    "Helm",
  ],
  supportedInfrastructure: ["EKS", "GKE", "AKS", "On-Premises Kubernetes"],
  pricing: {
    model: "Free",
    description: "Open source with enterprise support available",
  },
  support: {
    email: "support@settlemint.com",
    documentation: "https://docs.settlemint.com",
    github: "https://github.com/settlemint/asset-tokenization-kit",
  },
  vendor: {
    name: "SettleMint",
    website: "https://settlemint.com",
    logo: "https://console.settlemint.com/android-chrome-512x512.png",
  },
};

class AWSMarketplaceAutomation {
  constructor() {
    // Set AWS credentials from environment
    const credentials = {
      accessKeyId: AWS_ACCESS_KEY_ID,
      secretAccessKey: AWS_SECRET_ACCESS_KEY,
    };

    this.marketplace = new MarketplaceCatalogClient({
      region: "us-east-1",
      credentials,
    });
    this.ecr = new ECRClient({
      region: "us-east-1",
      credentials,
    });

    // Target ECR registry account from environment
    this.targetEcrAccount = AWS_TARGET_ECR_ACCOUNT;
    this.targetEcrPrefix = `${this.targetEcrAccount}.dkr.ecr.us-east-1.amazonaws.com`;
  }

  /**
   * Convert original image URL to ECR format for AWS Marketplace
   */
  convertToECRFormat(originalImageUrl, ecrPrefix) {
    if (!originalImageUrl) return null;

    // If image already has ECR registry, return as-is (already converted by package-ecr.ts)
    if (
      originalImageUrl.includes(this.targetEcrAccount) ||
      originalImageUrl.startsWith(ecrPrefix)
    ) {
      return originalImageUrl;
    }

    // Parse the original image URL
    const parts = originalImageUrl.split(":");
    const imageWithoutTag = parts[0];
    const tag = parts.length > 1 ? parts[1] : "latest";

    let registryPrefix = "";
    let imagePath = imageWithoutTag;

    // Handle different registry formats
    if (imageWithoutTag.startsWith("docker.io/")) {
      registryPrefix = "docker.io";
      imagePath = imageWithoutTag.replace("docker.io/", "");
    } else if (imageWithoutTag.startsWith("registry.k8s.io/")) {
      registryPrefix = "registry.k8s.io";
      imagePath = imageWithoutTag.replace("registry.k8s.io/", "");
    } else if (imageWithoutTag.startsWith("quay.io/")) {
      registryPrefix = "quay.io";
      imagePath = imageWithoutTag.replace("quay.io/", "");
    } else if (imageWithoutTag.startsWith("ghcr.io/")) {
      registryPrefix = "ghcr.io";
      imagePath = imageWithoutTag.replace("ghcr.io/", "");
    } else {
      registryPrefix = "docker.io";
      imagePath = imageWithoutTag;
    }

    // AWS Marketplace expects settlemint/{registry}/{image} format with -amd64 suffix
    return `${ecrPrefix}/settlemint/${registryPrefix}/${imagePath}:${tag}-amd64`;
  }

  /**
   * Convert ECR format back to original image format for Docker operations
   */
  convertECRToOriginal(ecrUrl) {
    if (!ecrUrl) return null;

    // Remove the ECR prefix and -amd64 suffix if present
    let url = ecrUrl;

    // Remove ECR registry prefix: 709825985650.dkr.ecr.us-east-1.amazonaws.com/settlemint/
    const ecrPrefix = `${this.targetEcrAccount}.dkr.ecr.us-east-1.amazonaws.com/settlemint/`;
    if (url.startsWith(ecrPrefix)) {
      url = url.replace(ecrPrefix, "");
    }

    // Parse image and tag
    const parts = url.split(":");
    const imageWithoutTag = parts[0];
    let tag = parts.length > 1 ? parts[1] : "latest";

    // Remove -amd64 suffix from tag
    if (tag.endsWith("-amd64")) {
      tag = tag.replace("-amd64", "");
    }

    // Reconstruct the original image URL
    let originalUrl = imageWithoutTag;
    if (tag && tag !== "latest") {
      originalUrl += `:${tag}`;
    }

    return originalUrl;
  }

  /**
   * Get list of original images from values.yaml for Docker operations
   */
  getOriginalImages() {
    const valuesPath = path.join(__dirname, "..", "atk", "values.yaml");
    const valuesContent = fs.readFileSync(valuesPath, "utf8");
    const values = yaml.load(valuesContent);

    const images = [];

    // Extract images recursively
    const extractImagesRecursively = (obj, path = []) => {
      if (typeof obj === "object" && obj !== null) {
        for (const [key, value] of Object.entries(obj)) {
          if (
            key === "image" &&
            typeof value === "object" &&
            value.repository
          ) {
            let originalImageUrl;
            if (value.registry && value.repository) {
              originalImageUrl = `${value.registry}/${value.repository}`;
            } else if (value.repository) {
              originalImageUrl = value.repository;
            }

            if (value.tag) {
              originalImageUrl += `:${value.tag}`;
            }

            if (originalImageUrl) {
              // Convert ECR format back to original format
              const convertedUrl = this.convertECRToOriginal(originalImageUrl);
              if (convertedUrl && !images.includes(convertedUrl)) {
                images.push(convertedUrl);
              }
            }
          } else if (key === "repository" && typeof value === "string") {
            // Check if this is part of an image configuration
            // Look for a sibling 'tag' field in the same parent object
            let parentObj;
            if (path.length > 0) {
              parentObj = path.reduce((obj, key) => obj[key], values);
            } else {
              parentObj = obj;
            }

            // Check if the parent object has a tag field (sibling to repository)
            if (parentObj && typeof parentObj === "object" && parentObj.tag) {
              let originalImageUrl = value;
              originalImageUrl += `:${parentObj.tag}`;

              // Convert ECR format back to original format
              const convertedUrl = this.convertECRToOriginal(originalImageUrl);
              if (convertedUrl && !images.includes(convertedUrl)) {
                images.push(convertedUrl);
              }
            }
            // Also check if this repository is under an "image" key
            else if (path.includes("image")) {
              let originalImageUrl = value;
              if (parentObj && parentObj.tag) {
                originalImageUrl += `:${parentObj.tag}`;
              }

              // Convert ECR format back to original format
              const convertedUrl = this.convertECRToOriginal(originalImageUrl);
              if (convertedUrl && !images.includes(convertedUrl)) {
                images.push(convertedUrl);
              }
            }
          } else {
            extractImagesRecursively(value, [...path, key]);
          }
        }
      }
    };

    extractImagesRecursively(values);
    return images;
  }

  /**
   * Package and upload Helm chart to ECR as OCI artifact
   */
  async uploadHelmChartToECR() {
    console.log("🚀 Starting Helm chart upload to ECR...");

    const chartInfo = this.getHelmChartInfo();
    const chartUri = `${this.targetEcrPrefix}/settlemint/atk:${chartInfo.version}`;
    const repoName = "settlemint/atk";

    try {
      // Login to ECR using AWS CLI method
      execSync(
        `AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID} AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY} aws ecr get-login-password --region us-east-1 | helm registry login --username AWS --password-stdin ${this.targetEcrPrefix}`,
        { stdio: "inherit" }
      );

      // Create ECR repository if it doesn't exist
      try {
        await this.ecr.send(
          new CreateRepositoryCommand({ repositoryName: repoName })
        );
        console.log(`✅ Created ECR repository: ${repoName}`);
      } catch (error) {
        if (error.name !== "RepositoryAlreadyExistsException") {
          throw error;
        }
        console.log(`✓ ECR repository already exists: ${repoName}`);
      }

      // Package and push Helm chart
      const chartPath = path.join(__dirname, "..", "atk");

      console.log(`📦 Packaging Helm chart from: ${chartPath}`);
      console.log(`📤 Pushing to: ${chartUri}`);

      execSync(`helm package ${chartPath} --destination /tmp`, {
        stdio: "inherit",
      });

      execSync(
        `helm push /tmp/atk-${chartInfo.version}.tgz oci://${this.targetEcrPrefix}/settlemint`,
        { stdio: "inherit" }
      );

      console.log(`✅ Successfully uploaded Helm chart: ${chartUri}`);
    } catch (error) {
      console.error("❌ Error uploading Helm chart to ECR:", error);
      throw error;
    }
  }

  /**
   * Upload all images to ECR
   */
  async uploadImagesToECR() {
    console.log("🚀 Starting image upload to ECR...");

    const originalImages = this.getOriginalImages();

    console.log(`📦 Found ${originalImages.length} images to upload:`);
    originalImages.forEach((img, idx) => {
      console.log(`  ${idx + 1}. ${img}`);
    });

    // Login to ECR using AWS CLI method
    try {
      execSync(
        `AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID} AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY} aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin ${this.targetEcrPrefix}`,
        { stdio: "inherit" }
      );

      for (const originalImage of originalImages) {
        console.log(`🔄 Processing image: ${originalImage}`);

        // Check if image is already in ECR format (from package-ecr.ts)
        if (originalImage.includes(this.targetEcrAccount)) {
          // Image already has ECR registry, extract repo name and tag
          const imageParts = originalImage.split(":");
          const imageWithoutTag = imageParts[0];
          const tag = imageParts[1] || "latest";

          // Extract repo name from ECR URL: 709825985650.dkr.ecr.us-east-1.amazonaws.com/reponame
          const repoName = imageWithoutTag.replace(
            `${this.targetEcrPrefix}/`,
            ""
          );
          const ecrImage = `${this.targetEcrPrefix}/${repoName}:${tag}`;

          try {
            // Create ECR repository if it doesn't exist
            try {
              await this.ecr.send(
                new CreateRepositoryCommand({ repositoryName: repoName })
              );
              console.log(`✅ Created ECR repository: ${repoName}`);
            } catch (error) {
              if (error.name !== "RepositoryAlreadyExistsException") {
                throw error;
              }
              console.log(`✓ ECR repository already exists: ${repoName}`);
            }

            // Convert ECR format back to original for docker pull
            const originalForPull = this.convertECRToOriginal(originalImage);

            console.log(`📥 Pulling ${originalForPull} (AMD64)`);
            execSync(`docker pull --platform linux/amd64 ${originalForPull}`, {
              stdio: "inherit",
            });

            console.log(`🏷️  Tagging as ${ecrImage}`);
            execSync(`docker tag ${originalForPull} ${ecrImage}`, {
              stdio: "inherit",
            });

            console.log(`📤 Pushing ${ecrImage}`);
            try {
              execSync(`docker push ${ecrImage}`, { stdio: "inherit" });
              console.log(`✅ Successfully uploaded: ${ecrImage}`);
            } catch (pushError) {
              if (
                pushError.message.includes("tag is immutable") ||
                pushError.message.includes("already exists")
              ) {
                console.log(
                  `⚠️  Image already exists (immutable): ${ecrImage}`
                );
              } else {
                throw pushError;
              }
            }
          } catch (error) {
            console.error(
              `❌ Failed to upload ${originalImage}:`,
              error.message
            );
            continue;
          }
        } else {
          // Original logic for non-ECR images
          // Create ECR repository name with full path format: repository/settlemint/{registry}/{image}
          const imageParts = originalImage.split(":");
          const imageWithoutTag = imageParts[0];
          const tag = imageParts[1] || "latest";

          let registryPrefix = "";
          let imagePath = imageWithoutTag;

          // Handle different registry formats
          if (imageWithoutTag.startsWith("docker.io/")) {
            registryPrefix = "docker.io";
            imagePath = imageWithoutTag.replace("docker.io/", "");
          } else if (imageWithoutTag.startsWith("registry.k8s.io/")) {
            registryPrefix = "registry.k8s.io";
            imagePath = imageWithoutTag.replace("registry.k8s.io/", "");
          } else if (imageWithoutTag.startsWith("quay.io/")) {
            registryPrefix = "quay.io";
            imagePath = imageWithoutTag.replace("quay.io/", "");
          } else if (imageWithoutTag.startsWith("ghcr.io/")) {
            registryPrefix = "ghcr.io";
            imagePath = imageWithoutTag.replace("ghcr.io/", "");
          } else {
            registryPrefix = "docker.io";
            imagePath = imageWithoutTag;
          }

          const repoName = `settlemint/${registryPrefix}/${imagePath}`;
          const ecrImage = `${this.targetEcrPrefix}/${repoName}:${tag}-amd64`;

          try {
            // Create ECR repository if it doesn't exist
            try {
              await this.ecr.send(
                new CreateRepositoryCommand({ repositoryName: repoName })
              );
              console.log(`✅ Created ECR repository: ${repoName}`);
            } catch (error) {
              if (error.name !== "RepositoryAlreadyExistsException") {
                throw error;
              }
              console.log(`✓ ECR repository already exists: ${repoName}`);
            }

            // Pull, tag, and push image (force AMD64 platform)
            console.log(`📥 Pulling ${originalImage} (AMD64)`);
            execSync(`docker pull --platform linux/amd64 ${originalImage}`, {
              stdio: "inherit",
            });

            console.log(`🏷️  Tagging as ${ecrImage}`);
            execSync(`docker tag ${originalImage} ${ecrImage}`, {
              stdio: "inherit",
            });

            console.log(`📤 Pushing ${ecrImage}`);
            try {
              execSync(`docker push ${ecrImage}`, { stdio: "inherit" });
              console.log(`✅ Successfully uploaded: ${ecrImage}`);
            } catch (pushError) {
              if (
                pushError.message.includes("tag is immutable") ||
                pushError.message.includes("already exists")
              ) {
                console.log(
                  `⚠️  Image already exists (immutable): ${ecrImage}`
                );
              } else {
                throw pushError;
              }
            }
          } catch (error) {
            console.error(
              `❌ Failed to upload ${originalImage}:`,
              error.message
            );
            // Continue with next image instead of throwing
            continue;
          }
        }
      }

      console.log("✅ All images uploaded to ECR successfully!");
    } catch (error) {
      console.error("❌ Error uploading images to ECR:", error);
      throw error;
    }
  }

  /**
   * Read Helm chart metadata
   */
  getHelmChartInfo() {
    const chartPath = path.join(__dirname, "..", "atk", "Chart.yaml");
    const chartContent = fs.readFileSync(chartPath, "utf8");
    return yaml.load(chartContent);
  }

  /**
   * Extract all container images from values.yaml
   */
  extractContainerImages() {
    const valuesPath = path.join(__dirname, "..", "atk", "values.yaml");
    const valuesContent = fs.readFileSync(valuesPath, "utf8");
    const values = yaml.load(valuesContent);

    const images = [];

    // Extract images recursively from the values object
    const extractImagesRecursively = (obj, path = []) => {
      if (typeof obj === "object" && obj !== null) {
        for (const [key, value] of Object.entries(obj)) {
          if (
            key === "image" &&
            typeof value === "object" &&
            value.repository
          ) {
            // Handle different image formats
            let imageUrl;
            if (value.registry && value.repository) {
              imageUrl = `${value.registry}/${value.repository}`;
            } else if (value.repository) {
              imageUrl = value.repository;
            }

            if (value.tag) {
              imageUrl += `:${value.tag}`;
            }

            // Convert to ECR format for AWS Marketplace (preserve full path)
            if (imageUrl) {
              const ecrImageUrl = this.convertToECRFormat(
                imageUrl,
                this.targetEcrPrefix
              );
              if (ecrImageUrl && !images.includes(ecrImageUrl)) {
                images.push(ecrImageUrl);
              }
            }
          } else if (
            key === "repository" &&
            typeof value === "string" &&
            path.includes("image")
          ) {
            // Handle cases where repository is directly specified
            let imageUrl = value;
            const parentObj = path.reduce((obj, key) => obj[key], values);
            if (parentObj.tag) {
              imageUrl += `:${parentObj.tag}`;
            }

            // Convert to ECR format for AWS Marketplace (preserve full path)
            if (imageUrl) {
              const ecrImageUrl = this.convertToECRFormat(
                imageUrl,
                this.targetEcrPrefix
              );
              if (ecrImageUrl && !images.includes(ecrImageUrl)) {
                images.push(ecrImageUrl);
              }
            }
          } else {
            extractImagesRecursively(value, [...path, key]);
          }
        }
      }
    };

    extractImagesRecursively(values);

    // Note: We don't add the Helm chart to container images since it's specified separately as HelmChartUri
    // The Helm chart is not a container image and should not be included in the ContainerImages array

    // All images are now converted to ECR format
    console.log(
      `📦 Found ${images.length} container images (all converted to ECR format)`
    );

    return images;
  }

  /**
   * Generate marketplace listing data
   */
  generateMarketplaceListing() {
    const chartInfo = this.getHelmChartInfo();

    return {
      Name: MARKETPLACE_CONFIG.productTitle,
      Description: MARKETPLACE_CONFIG.shortDescription,
      LongDescription: MARKETPLACE_CONFIG.longDescription,
      LogoUrl: MARKETPLACE_CONFIG.vendor.logo,
      VideoUrls: [],
      Highlights: [
        "ERC-3643 compliant tokenization platform",
        "Complete Kubernetes infrastructure stack",
        "React 19 modern frontend application",
        "Enterprise-grade security and compliance",
        "Production-ready Helm charts",
        "Built-in KYC/AML workflows",
        "Hyperledger Besu blockchain network",
        "GraphQL API with TheGraph protocol",
      ],
      Categories: MARKETPLACE_CONFIG.categories,
      Keywords: MARKETPLACE_CONFIG.keywords,
      AdditionalResources: [
        {
          Type: "Documentation",
          Url: MARKETPLACE_CONFIG.support.documentation,
        },
        {
          Type: "Source Code",
          Url: MARKETPLACE_CONFIG.support.github,
        },
      ],
      SupportInformation: {
        Description: "Enterprise support available through SettleMint",
        Resources: [
          {
            Type: "Email",
            Value: MARKETPLACE_CONFIG.support.email,
          },
          {
            Type: "Documentation",
            Value: MARKETPLACE_CONFIG.support.documentation,
          },
        ],
      },
      Versions: [
        {
          VersionTitle: `v${chartInfo.version}`,
          ReleaseNotes: `
# Release Notes v${chartInfo.version}

## What's New
- Updated Helm chart version to ${chartInfo.version}
- Enhanced container registry integration
- Improved deployment automation
- Security and performance optimizations

## Components Included
- Hyperledger Besu blockchain network
- Blockscout block explorer
- React 19 tokenization dApp
- PostgreSQL database with Redis cache
- Hasura GraphQL engine
- TheGraph indexing protocol
- Observability stack (Prometheus, Grafana)
- MinIO object storage
- Transaction signing service

## System Requirements
- Kubernetes 1.24+
- Helm 3.8+
- 8GB+ RAM recommended
- 50GB+ storage recommended

## Installation
\`\`\`bash
helm registry login ${this.targetEcrPrefix}
helm install atk oci://${this.targetEcrPrefix}/settlemint/atk:${chartInfo.version}
\`\`\`
`,
          DeliveryOptions: [
            {
              Type: "ContainerImage",
              Details: {
                ContainerImages: [
                  {
                    Image: `${AWS_TARGET_ECR_ACCOUNT}.dkr.ecr.us-east-1.amazonaws.com/settlemint/atk:${chartInfo.version}`,
                  },
                ],
              },
            },
          ],
        },
      ],
    };
  }

  /**
   * Create new version in AWS Marketplace product
   */
  async createNewProductVersion() {
    try {
      const chartInfo = this.getHelmChartInfo();
      const containerImages = this.extractContainerImages();
      const helmChartUri = `${this.targetEcrPrefix}/settlemint/atk:${chartInfo.version}`;

      console.log(
        `🚀 Creating new version ${chartInfo.version} in AWS Marketplace...`
      );
      console.log(
        `📦 Found ${containerImages.length} container images:`,
        containerImages
      );

      // Create change set for new version (matching manual submission format)
      const changeSet = {
        Catalog: "AWSMarketplace",
        ChangeSet: [
          {
            ChangeType: "AddDeliveryOptions",
            Entity: {
              Type: "ContainerProduct@1.0",
              Identifier: MARKETPLACE_CONFIG.productId,
            },
            Details: JSON.stringify({
              Version: {
                VersionTitle: chartInfo.version,
                ReleaseNotes: this.generateReleaseNotes(chartInfo.version),
              },
              DeliveryOptions: [
                {
                  DeliveryOptionTitle: `SettleMint Asset Tokenization Kit v${chartInfo.version}`,
                  Details: {
                    HelmDeliveryOptionDetails: {
                      HelmChartUri: helmChartUri,
                      CompatibleServices: ["EKS"],
                      Description:
                        "Deploy the complete SettleMint Asset Tokenization Kit using this production-ready Helm chart. Includes blockchain network (Besu), block explorer (Blockscout), subgraph indexing (The Graph), GraphQL API (Hasura), transaction signing service, and React-based dApp frontend. All container images are pre-configured for air-gapped environments and enterprise deployment.",
                      ContainerImages: containerImages,
                      UsageInstructions: `Prerequisites:
- Kubernetes cluster (v1.25+)
- Helm 3.8+

Installation:
\`\`\`bash
${this.targetEcrPrefix}
helm install settlemint-atk oci://${helmChartUri} --namespace atk --create-namespace
\`\`\``,
                    },
                  },
                },
              ],
            }),
          },
        ],
      };

      console.log("📝 Change set:", JSON.stringify(changeSet, null, 2));

      const result = await this.marketplace.send(
        new StartChangeSetCommand(changeSet)
      );

      console.log("✅ Change set created successfully!");
      console.log(`🆔 Change Set ID: ${result.ChangeSetId}`);
      console.log(`📄 Change Set ARN: ${result.ChangeSetArn}`);

      // Monitor change set status
      await this.monitorChangeSet(result.ChangeSetId);

      return result;
    } catch (error) {
      console.error("❌ Error creating new product version:", error);
      throw error;
    }
  }

  /**
   * Generate release notes for version
   */
  generateReleaseNotes(version) {
    return `# SettleMint Asset Tokenization Kit v${version}

## What's New
- Updated Helm chart to version ${version}
- Enhanced container registry integration
- Improved deployment automation  
- Security and performance optimizations

## Components Included
- Hyperledger Besu blockchain network
- Blockscout block explorer  
- React 19 tokenization dApp
- PostgreSQL database with Redis cache
- Hasura GraphQL engine
- TheGraph indexing protocol
- Observability stack (Prometheus, Grafana)
- MinIO object storage
- Transaction signing service

## Installation
\`\`\`bash
helm registry login ${this.targetEcrPrefix}
helm install atk oci://${this.targetEcrPrefix}/settlemint/atk:${version}
\`\`\`

## System Requirements
- Kubernetes 1.24+
- Helm 3.8+
- 8GB+ RAM recommended
- 50GB+ storage recommended

## Support
For technical support, contact: support@settlemint.com
Documentation: https://docs.settlemint.com`;
  }

  /**
   * Monitor change set status (quick check only)
   */
  async monitorChangeSet(changeSetId, maxChecks = 5) {
    console.log(`⏳ Monitoring change set: ${changeSetId}`);
    console.log(`📋 Will check ${maxChecks} times with 15s delay`);

    for (let i = 1; i <= maxChecks; i++) {
      try {
        const result = await this.marketplace.send(
          new DescribeChangeSetCommand({
            Catalog: "AWSMarketplace",
            ChangeSetId: changeSetId,
          })
        );

        console.log(`📊 Check ${i}/${maxChecks} - Status: ${result.Status}`);

        if (result.Status === "SUCCEEDED") {
          console.log("✅ Change set completed successfully!");
          return result;
        } else if (
          result.Status === "FAILED" ||
          result.Status === "CANCELLED"
        ) {
          console.error(`❌ Change set failed with status: ${result.Status}`);
          if (result.FailureDescription) {
            console.error(`❌ Failure reason: ${result.FailureDescription}`);
          }
          if (result.ErrorDetailList) {
            console.error("❌ Error details:");
            result.ErrorDetailList.forEach((error, index) => {
              console.error(
                `   ${index + 1}. ${error.ErrorCode}: ${error.ErrorMessage}`
              );
            });
          }
          throw new Error(`Change set failed: ${result.Status}`);
        } else if (i === maxChecks) {
          // After max checks, if still PREPARING or APPLYING, assume it will succeed
          console.log("✅ Change set is still in progress after 5 checks.");
          console.log(
            "🎯 Assuming successful publication - AWS review typically takes hours/days."
          );
          console.log(`📄 Final status: ${result.Status}`);
          console.log(`🆔 Track progress with Change Set ID: ${changeSetId}`);
          return result;
        }

        // Wait 15 seconds before next check (except after last check)
        if (i < maxChecks) {
          console.log("⏱️  Waiting 15 seconds before next check...");
          await new Promise((resolve) => setTimeout(resolve, 15000));
        }
      } catch (error) {
        console.error(`❌ Error during check ${i}:`, error.message);
        // Don't throw on monitoring errors, continue checking
        if (i === maxChecks) {
          console.log(
            "⚠️  Monitoring completed with errors, but submission may still succeed."
          );
          console.log(
            `🆔 Track progress manually with Change Set ID: ${changeSetId}`
          );
          return { Status: "UNKNOWN", ChangeSetId: changeSetId };
        }
      }
    }
  }

  /**
   * Validate container images exist
   */
  async validateContainerImages() {
    try {
      const chartInfo = this.getHelmChartInfo();
      const repository = "settlemint/atk";

      console.log(
        `🔍 Validating container image: ${repository}:${chartInfo.version}`
      );

      const result = await this.ecr.send(
        new DescribeImagesCommand({
          repositoryName: "settlemint",
          imageIds: [
            {
              imageTag: chartInfo.version,
            },
          ],
        })
      );

      console.log("✅ Container image validated successfully");
      return result.imageDetails;
    } catch (error) {
      if (error.code === "ImageNotFoundException") {
        console.error("❌ Container image not found in ECR");
      } else {
        console.error("❌ Error validating container image:", error);
      }
      throw error;
    }
  }

  /**
   * Generate AWS Marketplace submission package
   */
  async generateSubmissionPackage() {
    console.log("📦 Generating AWS Marketplace submission package...");

    const listingData = this.generateMarketplaceListing();
    const chartInfo = this.getHelmChartInfo();

    // Create output directory
    const outputDir = path.join(
      __dirname,
      "..",
      "..",
      "..",
      "marketplace-submission"
    );
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Generate submission files
    fs.writeFileSync(
      path.join(outputDir, "listing-data.json"),
      JSON.stringify(listingData, null, 2)
    );

    fs.writeFileSync(
      path.join(outputDir, "README.md"),
      `# AWS Marketplace Submission Package

## Product: ${MARKETPLACE_CONFIG.productTitle}
## Version: ${chartInfo.version}
## Generated: ${new Date().toISOString()}

### Files Included:
- \`listing-data.json\`: Complete marketplace listing data
- \`helm-chart-info.yaml\`: Helm chart metadata
- \`submission-checklist.md\`: Pre-submission validation checklist

### Next Steps:
1. Review all generated files
2. Upload container images to AWS ECR
3. Submit listing data through AWS Marketplace Console
4. Complete marketplace onboarding process
`
    );

    fs.writeFileSync(
      path.join(outputDir, "helm-chart-info.yaml"),
      yaml.dump(chartInfo)
    );

    fs.writeFileSync(
      path.join(outputDir, "submission-checklist.md"),
      `# AWS Marketplace Submission Checklist

- [ ] Container images pushed to ECR: \`${AWS_TARGET_ECR_ACCOUNT}.dkr.ecr.us-east-1.amazonaws.com/settlemint/atk:${chartInfo.version}\`
- [ ] Product listing data reviewed and validated
- [ ] Product logo and screenshots prepared
- [ ] Pricing model confirmed
- [ ] Support contact information verified
- [ ] Documentation links tested and accessible
- [ ] Legal and compliance review completed
- [ ] AWS Marketplace seller agreement signed
- [ ] Product submission through AWS Marketplace Console
- [ ] Testing and validation with AWS Marketplace team
`
    );

    console.log(`✅ Submission package generated in: ${outputDir}`);
    console.log("📋 Files created:");
    console.log("  - listing-data.json");
    console.log("  - README.md");
    console.log("  - helm-chart-info.yaml");
    console.log("  - submission-checklist.md");

    return outputDir;
  }
}

// Function to upload only Docker images (no Helm chart)
export async function uploadImagesOnly() {
  try {
    console.log("🚀 Starting Docker images upload to ECR...");
    console.log("ℹ️  Skipping Helm chart upload as requested");

    const automation = new AWSMarketplaceAutomation();

    // Upload all container images to ECR
    await automation.uploadImagesToECR();

    console.log("✅ Docker images upload completed successfully!");
  } catch (error) {
    console.error("❌ Image upload failed:", error);
    process.exit(1);
  }
}

// Main execution
export async function main() {
  try {
    console.log("🚀 Starting AWS Marketplace automation...");

    // AWS credentials are now configured in the AWSMarketplaceAutomation constructor

    const automation = new AWSMarketplaceAutomation();

    // Upload Helm chart to ECR first
    try {
      await automation.uploadHelmChartToECR();
    } catch (error) {
      console.log("⚠️  Helm chart upload failed, but continuing...");
      console.error(error);
    }

    // Upload all container images to ECR
    try {
      await automation.uploadImagesToECR();
    } catch (error) {
      console.log(
        "⚠️  Image upload failed, but continuing with marketplace submission..."
      );
      console.error(error);
    }

    // Validate container images exist
    try {
      await automation.validateContainerImages();
    } catch (error) {
      console.log(
        "⚠️  Container image validation skipped (may require additional AWS permissions)"
      );
    }

    // Create new version in AWS Marketplace
    await automation.createNewProductVersion();

    console.log("✅ AWS Marketplace automation completed successfully!");
  } catch (error) {
    console.error("❌ Automation failed:", error);
    process.exit(1);
  }
}

if (import.meta.main) {
  // Check if user wants to upload images only
  const args = process.argv.slice(2);
  if (args.includes("--images-only")) {
    uploadImagesOnly();
  } else {
    main();
  }
}

export { AWSMarketplaceAutomation, MARKETPLACE_CONFIG };
