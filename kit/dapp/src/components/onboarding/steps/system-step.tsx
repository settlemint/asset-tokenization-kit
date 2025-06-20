import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useStreamingMutation } from "@/hooks/use-streaming-mutation";
import { queryClient } from "@/lib/query.client";
import { orpc } from "@/orpc";
import { useQuery } from "@tanstack/react-query";
import { Shield } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

interface SystemStepProps {
  onSuccess?: () => void;
}

export function SystemStep({ onSuccess }: SystemStepProps) {
  const { t } = useTranslation(["onboarding", "general"]);

  const { data: systemAddress } = useQuery(
    orpc.settings.read.queryOptions({ input: { key: "SYSTEM_ADDRESS" } })
  );

  const { mutate: deploySystem, isTracking: isPending } = useStreamingMutation({
    mutationOptions: orpc.system.create.mutationOptions(),
    onSuccess: () => {
      toast.success(t("system.deployed"));
      void queryClient.invalidateQueries({
        queryKey: orpc.settings.read.key(),
      });
      onSuccess?.();
    },
  });

  const hasSystem = !!systemAddress?.value;

  return (
    <Card>
      <CardHeader>
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-sm-graphics-secondary/20">
          <Shield className="h-6 w-6 text-sm-graphics-secondary" />
        </div>
        <CardTitle>{t("system.title")}</CardTitle>
        <CardDescription>{t("system.description")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg bg-muted p-4">
          <p className="text-sm text-muted-foreground">{t("system.info")}</p>
        </div>

        <Button
          disabled={hasSystem || isPending}
          onClick={() => {
            deploySystem({});
          }}
          className="w-full"
        >
          {isPending ? t("general:deploying") : t("system.deploy")}
        </Button>

        {hasSystem && (
          <div className="rounded-lg border-l-4 border-sm-state-success bg-sm-state-success-background/20 p-4">
            <p className="text-sm font-medium text-sm-state-success-fg-deep dark:text-sm-state-success">
              {t("system.success")}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {systemAddress.value}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
