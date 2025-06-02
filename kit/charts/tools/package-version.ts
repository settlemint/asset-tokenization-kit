#!/usr/bin/env bun

import { Glob } from "bun";
import { relative } from "path";
import { parse, stringify } from "yaml";
import { getVersionInfo, updatePackageVersion } from "../../../tools/version";

interface ChartYaml {
  version: string;
  appVersion: string;
  [key: string]: unknown;
}

/**
 * Updates all Chart.yaml files in the ATK directory with the current version
 */
async function updateChartVersions(): Promise<void> {
  try {
    // Get the current version info
    const versionInfo = await getVersionInfo();
    const newVersion = versionInfo.version;

    console.log(`Updating charts to version: ${newVersion}`);

    // Find all Chart.yaml files in the ATK directory
    const glob = new Glob("atk/**/Chart.yaml");
    const chartFiles: string[] = [];

    for await (const file of glob.scan(".")) {
      chartFiles.push(file);
    }

    if (chartFiles.length === 0) {
      console.warn("No Chart.yaml files found in atk/");
      return;
    }

    console.log(`Found ${chartFiles.length} Chart.yaml files:`);

    let updatedCount = 0;

    for (const chartPath of chartFiles) {
      try {
        const relativePath = relative(process.cwd(), chartPath);
        console.log(`  Processing: ${relativePath}`);

        // Read the current Chart.yaml file
        const file = Bun.file(chartPath);
        if (!(await file.exists())) {
          console.warn(`    Skipping: File does not exist`);
          continue;
        }

        const content = await file.text();
        const chart = parse(content) as ChartYaml;

        // Check if version fields exist
        if (!chart.version && !chart.appVersion) {
          console.warn(`    Skipping: No version or appVersion fields found`);
          continue;
        }

        const oldVersion = chart.version;
        const oldAppVersion = chart.appVersion;

        // Update the version fields
        chart.version = newVersion;
        chart.appVersion = newVersion;

        // Convert back to YAML and write
        const updatedContent = stringify(chart);

        await Bun.write(chartPath, updatedContent);

        console.log(`    Updated: ${oldVersion} -> ${newVersion}`);
        if (oldAppVersion !== oldVersion) {
          console.log(
            `    Updated appVersion: ${oldAppVersion} -> ${newVersion}`
          );
        }

        updatedCount++;
      } catch (error) {
        console.error(`    Error processing ${chartPath}:`, error);
      }
    }

    console.log(`\nSuccessfully updated ${updatedCount} Chart.yaml files`);
  } catch (error) {
    console.error("Failed to update chart versions:", error);
    process.exit(1);
  }
}

// Run the script if called directly
if (import.meta.main) {
  await updateChartVersions();
  await updatePackageVersion();
}