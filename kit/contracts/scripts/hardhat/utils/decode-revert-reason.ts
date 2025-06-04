import {
  ContractFunctionExecutionError,
  ContractFunctionRevertedError,
  decodeErrorResult,
  Hex,
} from "viem";
import { SMARTContracts } from "../constants/contracts";

export const withDecodedRevertReason = async <ReturnType>(
  fn: () => Promise<ReturnType>
) => {
  try {
    return await fn();
  } catch (error) {
    if (error instanceof Error) {
      tryDecodeRevertReason(error);
    }
    throw error;
  }
};

export function tryDecodeRevertReason(error: Error): never {
  if (
    error instanceof ContractFunctionExecutionError &&
    error.cause instanceof ContractFunctionRevertedError
  ) {
    const revertReason = error.cause.raw;
    const parsedRevertReason = parseRevertReason(revertReason);
    if (parsedRevertReason) {
      throw parsedRevertReason;
    }
  }
  throw error;
}

function parseRevertReason(revertReason: Hex | undefined) {
  for (const abi of Object.values(SMARTContracts)) {
    try {
      const decoded = decodeErrorResult({
        abi,
        data: revertReason ?? "0x",
      });
      return new Error(
        `The contract reverted with reason: ${decoded.errorName ?? JSON.stringify(decoded, undefined, 2)}`
      );
    } catch {
      // ignore
    }
  }
  return null;
}
