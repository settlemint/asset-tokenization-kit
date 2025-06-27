import { authClient } from "@/lib/auth/auth.client";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute("/_private/_onboarded/asset-designer/")({
  component: AssetDesigner,
});

function AssetDesigner() {
  const { t } = useTranslation(["general"]);
  const navigate = useNavigate();
  const { data: session } = authClient.useSession();
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Asset Designer</h1>
      <div className="mt-4">
        <p>Hello "/_private/_onboarded/_asset-designer/"!</p>
      </div>
    </div>
  );
}
