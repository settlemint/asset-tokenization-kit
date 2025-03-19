"use client";

import { Card } from "@/components/ui/card";
import { ApiReferenceReact } from "@scalar/api-reference-react";
import "@scalar/api-reference-react/style.css";
import { useTheme } from "next-themes";

export default function ApiDocsPage() {
  const { resolvedTheme } = useTheme();

  return (
    <Card className="p-0">
      <ApiReferenceReact
        configuration={{
          url: "/api/swagger/json",
          withDefaultFonts: false,
          layout: "classic",
          customCss: `
          .scalar-app.scalar-api-reference,
          .scalar-api-reference .references-rendered {
            font-family: var(--font-sans);
          }
        `,
          hideClientButton: true,
          showSidebar: true,
          darkMode: resolvedTheme === "dark",
          tagsSorter: "alpha",
          operationsSorter: "alpha",
          hideDarkModeToggle: true,
        }}
      />
    </Card>
  );
}
