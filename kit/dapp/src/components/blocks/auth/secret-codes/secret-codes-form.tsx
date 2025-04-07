import { getSecretCodes } from "@/lib/mutations/user/security-codes/get-secret-codes-action";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CopySecretCodes } from "./copy-secret-codes";

interface SecretCodesFormProps {
  onSecretCodesChange?: (secretCodes: string[]) => void;
}

export function SecretCodesForm({ onSecretCodesChange }: SecretCodesFormProps) {
  const [secretCodes, setSecretCodes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const t = useTranslations("portfolio.settings.profile.secret-codes");

  useEffect(() => {
    if (
      secretCodes.length > 0 &&
      !isLoading &&
      typeof onSecretCodesChange === "function"
    ) {
      onSecretCodesChange(secretCodes);
    }
  }, [secretCodes, onSecretCodesChange, isLoading]);

  const fetchSecretCodes = async () => {
    try {
      setIsLoading(true);
      const response = await getSecretCodes();
      if (response?.serverError || response?.validationErrors) {
        toast.error(t("error-message"));
      } else {
        setSecretCodes(response?.data?.secretCodes ?? []);
      }
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
    fetchSecretCodes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {isLoading ? (
        <Loader2 size={16} className="mr-2 animate-spin" />
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
