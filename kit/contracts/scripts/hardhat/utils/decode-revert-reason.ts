import { readdir, readFile, stat } from "node:fs/promises";
import path, { join } from "node:path";
import {
  CallExecutionError,
  ContractFunctionExecutionError,
  ContractFunctionRevertedError,
  decodeErrorResult,
  ExecutionRevertedError,
  Hex,
  isHex,
} from "viem";
import { ATKContracts } from "../constants/contracts";

const ARTIFACTS_DIR = join(__dirname, "../../../.generated/artifacts");

export const withDecodedRevertReason = async <ReturnType>(
  fn: () => Promise<ReturnType>
) => {
  try {
    return await fn();
  } catch (error) {
    if (error instanceof Error) {
      await tryDecodeRevertReason(error);
    }
    throw error;
  }
};

async function tryDecodeRevertReason(error: Error): Promise<never> {
  if (
    error instanceof ContractFunctionExecutionError &&
    error.cause instanceof ContractFunctionRevertedError
  ) {
    const revertReason = error.cause.raw;
    const parsedRevertReason = await parseRevertReason(revertReason);
    if (parsedRevertReason) {
      throw parsedRevertReason;
    }
    console.log("Failed to decode revert reason");
  }

  if (
    error instanceof CallExecutionError &&
    error.cause instanceof ExecutionRevertedError
  ) {
    const shortMessage = error.cause.shortMessage;
    let extractedHex: string | undefined;

    const parts = shortMessage?.split("custom error");
    if (parts && parts[1]) {
      let hexPart = parts[1];
      // Remove whitespace, colons, and periods from the hex part
      extractedHex = hexPart.replace(/[\s:.]/g, "");
    }

    if (extractedHex && isHex(extractedHex)) {
      const parsedRevertReason = await parseRevertReason(extractedHex);
      if (parsedRevertReason) {
        throw parsedRevertReason;
      }
    }
  }

  console.log("Cannot parse revert reason, unknown error", error);
  throw error;
}

export async function parseRevertReason(revertReason: Hex | undefined) {
  console.log("Attempting to decode revert reason:", revertReason);

  // First try with ATKContracts
  for (const [contractName, abi] of Object.entries(ATKContracts)) {
    const decoded = decodeRevertReason(revertReason, abi);
    if (decoded) {
      console.log(`Decoded with ATKContract: ${contractName}`);
      return decoded;
    }
  }

  // Then try with all ABIs from artifacts
  const allAbis = await getAllAbis();
  for (const abi of allAbis) {
    const decoded = decodeRevertReason(revertReason, abi);
    if (decoded) {
      console.log(`ABI '${abi.filePath}' should have been included`);
      return decoded;
    }
  }

  console.log(
    "Could not decode revert reason - error selector not found in any ABI"
  );
  return null;
}

function decodeRevertReason(revertReason: Hex | undefined, abi: any) {
  try {
    const decoded = decodeErrorResult({
      abi,
      data: revertReason ?? "0x",
    });
    return new Error(
      `The contract reverted with reason: ${decoded.errorName ? `${decoded.errorName} (args: ${decoded.args ? decoded.args.join(", ") : "/"})` : JSON.stringify(decoded, undefined, 2)}`
    );
  } catch {
    // ignore
  }
}

let allAbisCache:
  | {
      filePath: string;
      contents: { abi: any };
    }[]
  | null = null;

async function getAllAbis() {
  if (allAbisCache) {
    return allAbisCache;
  }
  const artifactFiles = await readdir(ARTIFACTS_DIR, { recursive: true });
  const result = (
    await Promise.all(
      artifactFiles.map(async (fileName) => {
        try {
          const filePath = path.join(ARTIFACTS_DIR, fileName);
          const fileInfo = await stat(filePath);
          if (
            fileInfo.isDirectory() ||
            !fileName.toLowerCase().endsWith(".json")
          ) {
            return null;
          }
          const contents = JSON.parse(await readFile(filePath, "utf8"));
          if (!contents.abi) {
            return null;
          }
          return {
            filePath,
            contents,
          };
        } catch {
          return null;
        }
      })
    )
  ).filter((item) => !!item);
  console.log(`Found ${result.length} abis in ${ARTIFACTS_DIR}`);
  allAbisCache = result;
  return result;
}
