#!/usr/bin/env bun

import { $ } from "bun";
import { existsSync, mkdirSync } from "node:fs";
import { join, resolve } from "node:path";

interface ExtractOptions {
  releaseName?: string;
  namespace?: string;
  outputDir?: string;
}

async function extractEnvFromHelmNotes(options: ExtractOptions = {}) {
  const {
    releaseName = "atk",
    namespace = "atk",
    outputDir = resolve(process.cwd(), "../../"),
  } = options;

  try {
    // Get the helm notes output
    console.log(
      `📋 Extracting environment configuration from Helm release '${releaseName}' in namespace '${namespace}'...`
    );

    const notesResult =
      await $`helm get notes ${releaseName} -n ${namespace}`.text();

    if (!notesResult) {
      throw new Error("No notes found for the specified release");
    }

    // Find the .env section
    const envStartMarker = "=== .env ===";
    const envLocalStartMarker = "=== .env.local ===";
    const sectionEndMarker =
      "========================================================================";

    const envStart = notesResult.indexOf(envStartMarker);
    const envLocalStart = notesResult.indexOf(envLocalStartMarker);

    if (envStart === -1 || envLocalStart === -1) {
      throw new Error(
        "Could not find environment variable sections in helm notes"
      );
    }

    // Extract .env content
    const envEndSearch = notesResult.indexOf("\n\n", envStart);
    const envContent = notesResult
      .substring(envStart + envStartMarker.length, envEndSearch)
      .trim();

    // Extract .env.local content
    const envLocalEndSearch = notesResult.indexOf(
      sectionEndMarker,
      envLocalStart
    );
    const envLocalContent = notesResult
      .substring(envLocalStart + envLocalStartMarker.length, envLocalEndSearch)
      .trim();

    // Ensure output directory exists
    if (!existsSync(outputDir)) {
      mkdirSync(outputDir, { recursive: true });
    }

    // Write .env file
    const envPath = join(outputDir, ".env");
    await Bun.write(envPath, envContent + "\n");
    console.log(`✅ Created ${envPath}`);

    // Write .env.local file
    const envLocalPath = join(outputDir, ".env.local");
    await Bun.write(envLocalPath, envLocalContent + "\n");
    console.log(`✅ Created ${envLocalPath}`);

    // Display a summary
    console.log("\n📝 Environment files created successfully!");
    console.log("\n⚠️  Important notes:");
    console.log(
      "   - Review and update the MinIO credentials (marked with <MINIO_ACCESS_KEY> and <MINIO_SECRET_KEY>)"
    );
    console.log(
      "   - These files contain sensitive information - do not commit them to version control"
    );
    console.log(
      "   - Add .env and .env.local to your .gitignore if not already present"
    );
  } catch (error) {
    console.error("❌ Error extracting environment configuration:", error);
    if (error instanceof Error && error.message.includes("not found")) {
      console.error("\n💡 Make sure:");
      console.error("   - Helm is installed and available in your PATH");
      console.error("   - The release name and namespace are correct");
      console.error(
        "   - You have the necessary permissions to access the release"
      );
    }
    process.exit(1);
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
const options: ExtractOptions = {};

for (let i = 0; i < args.length; i++) {
  switch (args[i]) {
    case "--release":
    case "-r":
      options.releaseName = args[++i];
      break;
    case "--namespace":
    case "-n":
      options.namespace = args[++i];
      break;
    case "--output":
    case "-o":
      options.outputDir = args[++i];
      break;
    case "--help":
    case "-h":
      console.log(`
Usage: bun run extract-env.ts [options]

Options:
  -r, --release <name>      Helm release name (default: atk)
  -n, --namespace <name>    Kubernetes namespace (default: atk)
  -o, --output <dir>        Output directory for env files (default: ../../)
  -h, --help                Show this help message

Example:
  bun run extract-env.ts --release my-atk --namespace production --output ./config
`);
      process.exit(0);
  }
}

// Run the extraction
await extractEnvFromHelmNotes(options);
