import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  Building2,
  Clock,
  Coins,
  FileJson,
  Layers,
  Settings,
  ShieldCheck,
} from "lucide-react";
import { useTranslations } from "next-intl";
import * as React from "react";

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface BentoFeatureProps extends React.HTMLAttributes<HTMLDivElement> {}

const BentoFeatureSection = React.forwardRef<HTMLDivElement, BentoFeatureProps>(
  ({ className, ...props }, ref) => {
    const t = useTranslations("homepage");

    return (
      <section
        ref={ref}
        className={cn(
          "relative z-10 mx-auto max-w-7xl px-4 py-24 mt-8 md:px-8",
          className
        )}
        {...props}
      >
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">
            {t("features.title")}
          </h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            {t("features.description")}
          </p>
        </div>

        {/* Bento Grid for Platform Features */}
        <div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 group">
            {/* Full Asset Lifecycle */}
            <Card className="transition-all hover:shadow-md duration-300 transform group-hover:scale-95 hover:!scale-105 hover:z-10">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-primary/10 p-2 text-primary">
                    <Coins className="h-6 w-6" />
                  </div>
                  <CardTitle>{t("features.asset-lifecycle.title")}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm">
                  {t("features.asset-lifecycle.description")}
                </CardDescription>
              </CardContent>
            </Card>

            {/* Deep Insights */}
            <Card className="transition-all hover:shadow-md duration-300 transform group-hover:scale-95 hover:!scale-105 hover:z-10">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-primary/10 p-2 text-primary">
                    <BarChart3 className="h-6 w-6" />
                  </div>
                  <CardTitle>{t("features.insights.title")}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm">
                  {t("features.insights.description")}
                </CardDescription>
              </CardContent>
            </Card>

            {/* Comprehensive Compliance */}
            <Card className="transition-all hover:shadow-md duration-300 transform group-hover:scale-95 hover:!scale-105 hover:z-10">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-primary/10 p-2 text-primary">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  <CardTitle>{t("features.compliance.title")}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm">
                  {t("features.compliance.description")}
                </CardDescription>
              </CardContent>
            </Card>

            {/* Intuitive Interface */}
            <Card className="transition-all hover:shadow-md duration-300 transform group-hover:scale-95 hover:!scale-105 hover:z-10">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-primary/10 p-2 text-primary">
                    <Layers className="h-6 w-6" />
                  </div>
                  <CardTitle>{t("features.interface.title")}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm">
                  {t("features.interface.description")}
                </CardDescription>
              </CardContent>
            </Card>

            {/* Complete API Coverage */}
            <Card className="transition-all hover:shadow-md duration-300 transform group-hover:scale-95 hover:!scale-105 hover:z-10">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-primary/10 p-2 text-primary">
                    <FileJson className="h-6 w-6" />
                  </div>
                  <CardTitle>{t("features.api.title")}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm">
                  {t("features.api.description")}
                </CardDescription>
              </CardContent>
            </Card>

            {/* 100% Customizable */}
            <Card className="transition-all hover:shadow-md duration-300 transform group-hover:scale-95 hover:!scale-105 hover:z-10">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-primary/10 p-2 text-primary">
                    <Settings className="h-6 w-6" />
                  </div>
                  <CardTitle>{t("features.customizable.title")}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm">
                  {t("features.customizable.description")}
                </CardDescription>
              </CardContent>
            </Card>

            {/* Shortest Time to Market */}
            <Card className="transition-all hover:shadow-md duration-300 transform group-hover:scale-95 hover:!scale-105 hover:z-10">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-primary/10 p-2 text-primary">
                    <Clock className="h-6 w-6" />
                  </div>
                  <CardTitle>{t("features.time-to-market.title")}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm">
                  {t("features.time-to-market.description")}
                </CardDescription>
              </CardContent>
            </Card>

            {/* Purpose-Built */}
            <Card className="transition-all hover:shadow-md duration-300 transform group-hover:scale-95 hover:!scale-105 hover:z-10">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-primary/10 p-2 text-primary">
                    <Building2 className="h-6 w-6" />
                  </div>
                  <CardTitle>{t("features.purpose-built.title")}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm">
                  {t("features.purpose-built.description")}
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    );
  }
);

BentoFeatureSection.displayName = "BentoFeatureSection";

export { BentoFeatureSection };
