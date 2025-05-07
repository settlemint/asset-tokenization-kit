import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Link } from "@/i18n/routing";
import { Check } from "lucide-react";
import { getTranslations } from "next-intl/server";

export async function Pricing() {
  const t = await getTranslations("homepage.pricing");

  return (
    <section className="py-16 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl space-y-6 text-center">
          <h1 className="text-center text-4xl font-semibold lg:text-5xl">
            {t("title")}
          </h1>
        </div>

        <div className="mt-8 grid gap-6 md:mt-20 md:grid-cols-2">
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle className="font-medium">
                {t("starter.title")}
              </CardTitle>
              <span className="my-3 block text-2xl font-semibold">
                {t("starter.price")}
              </span>
              <CardDescription className="text-sm">
                {t("starter.description")}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <hr className="border-dashed" />

              <ul className="list-outside space-y-3 text-sm">
                {[
                  t("starter.feature1"),
                  t("starter.feature2"),
                  t("starter.feature3"),
                  t("starter.feature4"),
                  t("starter.feature5"),
                  t("starter.feature6"),
                  t("starter.feature7"),
                ].map((item, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <Check className="size-3" />
                    {item}
                  </li>
                ))}
              </ul>
            </CardContent>

            <CardFooter className="mt-auto">
              <Button asChild variant="outline" className="w-full">
                <Link href="">{t("starter.cta")}</Link>
              </Button>
            </CardFooter>
          </Card>

          <Card className="relative flex flex-col">
            <span className="bg-gradient-to-br absolute inset-x-0 -top-3 mx-auto flex h-6 w-fit items-center rounded-full from-[var(--color-sm-graphics-quaternary)] to-[var(--color-sm-accent)] px-3 py-1 text-xs font-medium text-primary-foreground ring-1 ring-inset ring-white/20 ring-offset-1 ring-offset-gray-950/5">
              {t("enterprise.badge")}
            </span>

            <CardHeader>
              <CardTitle className="font-medium">
                {t("enterprise.title")}
              </CardTitle>
              <span className="my-3 block text-2xl font-semibold">
                {t("enterprise.price")}
              </span>
              <CardDescription className="text-sm">
                {t("enterprise.description")}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <hr className="border-dashed" />

              <ul className="list-outside space-y-3 text-sm">
                {[
                  t("enterprise.feature1"),
                  t("enterprise.feature2"),
                  t("enterprise.feature3"),
                  t("enterprise.feature4"),
                  t("enterprise.feature5"),
                ].map((item, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <Check className="size-3" />
                    {item}
                  </li>
                ))}
              </ul>
            </CardContent>

            <CardFooter className="mt-auto">
              <Button asChild className="w-full">
                <Link href="">{t("enterprise.cta")}</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </section>
  );
}
