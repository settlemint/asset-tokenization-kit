#!/usr/bin/env bun

import { readdir, readFile, writeFile } from "fs/promises";
import { gzipSync } from "zlib";
import { join } from "path";

async function compressFile(inputPath: string, outputPath: string) {
  console.log(`Compressing ${inputPath} -> ${outputPath}`);
  const content = await readFile(inputPath);
  const compressed = gzipSync(content, { level: 9 }); // Maximum compression
  await writeFile(outputPath, compressed);
  
  const originalSize = content.length;
  const compressedSize = compressed.length;
  const ratio = ((1 - compressedSize / originalSize) * 100).toFixed(1);
  console.log(`  Original: ${(originalSize / 1024).toFixed(1)} KB`);
  console.log(`  Compressed: ${(compressedSize / 1024).toFixed(1)} KB`);
  console.log(`  Compression ratio: ${ratio}%`);
}

async function main() {
  // Compress genesis file
  const genesisPath = "atk/charts/besu-network/charts/besu-genesis/files/genesis-output.json";
  const genesisCompressedPath = "atk/charts/besu-network/charts/besu-genesis/files/genesis-output.json.gz";
  
  try {
    await compressFile(genesisPath, genesisCompressedPath);
  } catch (error) {
    console.error(`Failed to compress genesis file: ${error}`);
  }

  // Compress ABI files
  const abisDir = "atk/charts/portal/abis";
  try {
    const files = await readdir(abisDir);
    const jsonFiles = files.filter(f => f.endsWith('.json'));
    
    for (const file of jsonFiles) {
      const inputPath = join(abisDir, file);
      const outputPath = join(abisDir, `${file}.gz`);
      await compressFile(inputPath, outputPath);
    }
  } catch (error) {
    console.error(`Failed to compress ABI files: ${error}`);
  }
}

main().catch(console.error);