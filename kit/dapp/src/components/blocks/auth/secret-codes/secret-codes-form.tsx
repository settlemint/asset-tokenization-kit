import { Skeleton } from "@/components/ui/skeleton";
import { generateSecretCodes } from "@/lib/mutations/user/security-codes/generate-secret-codes-action";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CopySecretCodes } from "./copy-secret-codes";

export function SecretCodesForm() {
  const [secretCodes, setSecretCodes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const t = useTranslations("portfolio.settings.profile.secret-codes");

  const generate = async () => {
    try {
      console.log("generating secret codes");
      setIsLoading(true);
      const response = await generateSecretCodes();
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
    generate();
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
