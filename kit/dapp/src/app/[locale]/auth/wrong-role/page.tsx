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
import { getTranslations } from "next-intl/server";

export async function generateMetadata() {
  const t = await getTranslations("auth.wrong-role");
  return {
    title: t("title"),
  };
}

export default async function WrongRolePage() {
  const t = await getTranslations("auth.wrong-role");

  return (
    <div className="container flex h-screen flex-col items-center justify-center">
      <Card className="mx-auto w-full max-w-md">
        <CardHeader>
          <CardTitle>{t("title")}</CardTitle>
          <CardDescription>{t("description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{t("description")}</p>
        </CardContent>
        <CardFooter>
          <Button asChild className="w-full">
            <Link href="/portfolio">{t("go-to-portfolio")}</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
