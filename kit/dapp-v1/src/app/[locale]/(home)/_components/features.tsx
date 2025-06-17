import {
  BarChart3,
  Coins,
  FileJson,
  Layers,
  Settings,
  ShieldCheck,
} from "lucide-react";
import { getTranslations } from "next-intl/server";
export async function Features() {
  const t = await getTranslations("homepage");

  return (
    <section className="py-12 md:py-20">
      <div className="mx-auto max-w-5xl space-y-8 px-6 md:space-y-16">
        <div className="relative z-10 mx-auto max-w-xl space-y-6 text-center md:space-y-12">
          <h2 className="text-balance text-4xl font-medium lg:text-5xl">
            {t("features.title")}
          </h2>
          <p>{t("features.description")}</p>
        </div>

        <div className="relative mx-auto grid max-w-4xl divide-x divide-y border *:p-12 sm:grid-cols-2 lg:grid-cols-3 rounded-2xl">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Coins className="size-4" />
              <h3 className="text-sm font-semibold">
                {t("features.asset-lifecycle.title")}
              </h3>
            </div>
            <p className="text-sm">
              {t("features.asset-lifecycle.description")}
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Layers className="size-4" />

              <h3 className="text-sm font-semibold">
                {t("features.interface.title")}
              </h3>
            </div>
            <p className="text-sm">{t("features.interface.description")}</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-4" />

              <h3 className="text-sm font-semibold">
                {t("features.compliance.title")}
              </h3>
            </div>
            <p className="text-sm">{t("features.compliance.description")}</p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <FileJson className="size-4" />

              <h3 className="text-sm font-semibold">
                {t("features.api.title")}
              </h3>
            </div>
            <p className="text-sm">{t("features.api.description")}</p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <BarChart3 className="size-4" />
              <h3 className="text-sm font-semibold">
                {t("features.insights.title")}
              </h3>
            </div>
            <p className="text-sm">{t("features.insights.description")}</p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Settings className="size-4" />

              <h3 className="text-sm font-semibold">
                {t("features.customizable.title")}
              </h3>
            </div>
            <p className="text-sm">{t("features.customizable.description")}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
