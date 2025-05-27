import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Eye, Pencil } from "lucide-react";
import { useTranslations } from "next-intl";

export function AuthorizationStatusLayout() {
  const t = useTranslations("regulations.mica.dashboard.authorization-status");

  return (
    <Card className="w-full h-full flex flex-col">
      <CardHeader className="space-y-4">
        <div className="flex items-center justify-between">
          <CardTitle>{t("title")}</CardTitle>
          <Badge className="!bg-success/80 !text-success-foreground border-transparent">
            MiCA-2023-12345-EU
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="space-y-2">
          <h3 className="text-muted-foreground text-sm">
            {t("compliance-requirements")}
          </h3>

          <div className="space-y-4 mt-4">
            {[
              t("fields.legal-entity"),
              t("fields.management-vetting"),
              t("fields.regulatory-approval"),
              t("fields.eu-passport-status"),
            ].map((requirement) => (
              <div
                key={requirement}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-success" />
                  <p>{requirement}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="!bg-success/80 !text-success-foreground border-transparent">
                    {t("complete")}
                  </Badge>
                  <div className="flex gap-4 ml-4">
                    <button className="text-muted-foreground hover:text-foreground transition-colors">
                      <Eye className="h-5 w-5" />
                    </button>
                    <button className="text-muted-foreground hover:text-foreground transition-colors">
                      <Pencil className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
