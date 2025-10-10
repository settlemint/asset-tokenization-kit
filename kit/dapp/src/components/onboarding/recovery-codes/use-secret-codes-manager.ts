import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { authClient } from "@/lib/auth/auth.client";

import { useRecoveryCodes } from "./use-recovery-codes";

type SecretCodesCallbacks = {
  onGenerateSuccess?: (codes: string[]) => void | Promise<void>;
  onGenerateError?: (message: string, error?: unknown) => void;
  onConfirmSuccess?: () => void | Promise<void>;
  onConfirmError?: (message: string, error?: unknown) => void;
};

type GenerateParams = {
  password?: string;
};

type GenerateResult = {
  success: boolean;
  codes?: string[];
  error?: string;
};

type ConfirmResult = {
  success: boolean;
  error?: string;
};

interface UseSecretCodesManagerOptions extends SecretCodesCallbacks {
  initialCodes?: string[];
}

export function useSecretCodesManager({
  initialCodes,
  onGenerateSuccess,
  onGenerateError,
  onConfirmSuccess,
  onConfirmError,
}: UseSecretCodesManagerOptions = {}) {
  const [codes, setCodes] = useState<string[]>(() => initialCodes ?? []);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [hasPerformedAction, setHasPerformedAction] = useState(false);
  const previousInitialCodes = useRef<string | null>(null);

  useEffect(() => {
    if (!initialCodes) {
      return;
    }
    const serialized = initialCodes.join("|");
    if (previousInitialCodes.current === serialized) {
      return;
    }
    previousInitialCodes.current = serialized;
    setCodes(initialCodes);
    setHasPerformedAction(false);
  }, [initialCodes]);

  const { handleCopyAll, handleDownload } = useRecoveryCodes(codes);

  const markActionPerformed = useCallback(() => {
    setHasPerformedAction(true);
  }, []);

  const copyAll = useCallback(() => {
    handleCopyAll();
    markActionPerformed();
  }, [handleCopyAll, markActionPerformed]);

  const download = useCallback(() => {
    handleDownload();
    markActionPerformed();
  }, [handleDownload, markActionPerformed]);

  const generate = useCallback(
    async ({ password }: GenerateParams = {}): Promise<GenerateResult> => {
      setIsGenerating(true);
      setHasPerformedAction(false);
      try {
        const response = await authClient.secretCodes.generate(
          password ? { password } : {}
        );
        if (response.error) {
          const message = response.error.message || "Failed to generate codes";
          onGenerateError?.(message, response.error);
          return { success: false, error: message };
        }
        const generatedCodes = response.data?.secretCodes ?? [];
        setCodes(generatedCodes);
        await onGenerateSuccess?.(generatedCodes);
        return { success: true, codes: generatedCodes };
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to generate codes";
        onGenerateError?.(message, error);
        return { success: false, error: message };
      } finally {
        setIsGenerating(false);
      }
    },
    [onGenerateError, onGenerateSuccess]
  );

  const confirm = useCallback(async (): Promise<ConfirmResult> => {
    setIsConfirming(true);
    try {
      const response = await authClient.secretCodes.confirm({ stored: true });
      if (response?.error) {
        const message = response.error.message || "Failed to confirm codes";
        onConfirmError?.(message, response.error);
        return { success: false, error: message };
      }
      await onConfirmSuccess?.();
      return { success: true };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to confirm codes";
      onConfirmError?.(message, error);
      return { success: false, error: message };
    } finally {
      setIsConfirming(false);
    }
  }, [onConfirmError, onConfirmSuccess]);

  const resetCodes = useCallback(() => {
    setCodes([]);
    setHasPerformedAction(false);
  }, []);


  return {
    codes,
    isGenerating,
    isConfirming,
    hasPerformedAction,
    setHasPerformedAction,
    generate,
    confirm,
    copyAll,
    download,
    resetCodes,
    canConfirm,
  };
}
