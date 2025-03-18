import { Card } from "@/components/ui/card";
import { ApiReferenceReact } from "@scalar/api-reference-react";
import "@scalar/api-reference-react/style.css";

export default function ApiDocsPage() {
  return (
    <Card className="p-0">
      <ApiReferenceReact
        configuration={{
          url: "/api/swagger/json",
          withDefaultFonts: false,
          customCss: `
          .scalar-app.scalar-api-reference,
          .scalar-api-reference .references-rendered {
            font-family: var(--font-sans);
            background: transparent;
          }
          .scalar-app .references-navigation-list {
            border-top-left-radius: 14px;
            border-bottom-left-radius: 14px;
          }
          .scalar-app section{
          padding-top: 2em !important;
          padding-bottom: 4em !important;
          }
        `,
          hideClientButton: true,
          showSidebar: true,
        }}
      />
    </Card>
  );
}
