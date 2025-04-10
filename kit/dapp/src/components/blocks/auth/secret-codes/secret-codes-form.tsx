import { Skeleton } from "@/components/ui/skeleton";
import { authClient } from "@/lib/auth/client";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CopySecretCodes } from "./copy-secret-codes";

interface SecretCodesFormProps {
  existingSecretCodes?: string[];
}

export function SecretCodesForm({ existingSecretCodes }: SecretCodesFormProps) {
  const [secretCodes, setSecretCodes] = useState<string[]>(
    existingSecretCodes ?? []
  );
  const [isLoading, setIsLoading] = useState(
    !Array.isArray(existingSecretCodes)
  );
  const t = useTranslations("portfolio.settings.profile.secret-codes");

  const generate = async () => {
    try {
      setIsLoading(true);
      const { error, data } = await authClient.secretCodes.generate();
      if (error) {
        throw new Error(error.message);
      }
      setSecretCodes(data.secretCodes);
    } catch (error) {
      toast.error(
        t("error-message", {
          error: error instanceof Error ? error.message : "Unknown error",
        })
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (Array.isArray(existingSecretCodes)) {
      setSecretCodes(existingSecretCodes);
      return;
    }
    const timeout = setTimeout(() => {
      generate();
    }, 1000);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {isLoading ? (
        <Skeleton className="h-40 w-full bg-muted/50" />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 text-sm">
            {secretCodes.map((code) => (
              <div key={code} className="font-mono text-center">
                {code}
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-center">
            <CopySecretCodes secretCodes={secretCodes} />
          </div>
        </>
      )}
    </>
  );
}
