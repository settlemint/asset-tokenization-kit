import { BurnSheet } from "@/components/manage-dropdown/sheets/burn-sheet";
import { CollateralSheet } from "@/components/manage-dropdown/sheets/collateral-sheet";
import { MintSheet } from "@/components/manage-dropdown/sheets/mint-sheet";
import { Button } from "@/components/ui/button";
import type { Token } from "@/orpc/routes/token/routes/token.read.schema";
import { Flame, Plus, Shield } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  RelatedGrid,
  RelatedGridContent,
  RelatedGridItem,
  RelatedGridItemContent,
  RelatedGridItemDescription,
  RelatedGridItemFooter,
  RelatedGridItemTitle,
} from "./related-grid";

interface TokenRelatedActionsProps {
  asset: Token;
}

type ActionKey = "collateral" | "mint" | "burn";

export function TokenRelatedActions({ asset }: TokenRelatedActionsProps) {
  const { t } = useTranslation(["tokens"]);
  const [open, setOpen] = useState<ActionKey | null>(null);

  const isPaused = asset.pausable?.paused ?? false;

  const can = useMemo(
    () => ({
      collateral:
        asset.collateral != null &&
        (asset.userPermissions?.actions?.updateCollateral ?? false),
      mint: (asset.userPermissions?.actions?.mint ?? false) && !isPaused,
      burn: (asset.userPermissions?.actions?.burn ?? false) && !isPaused,
    }),
    [asset, isPaused]
  );

  if (!can.collateral && !can.mint && !can.burn) return null;

  return (
    <RelatedGrid className="space-y-4">
      <RelatedGridContent columns={3} animate>
        {can.collateral && (
          <RelatedGridItem>
            <RelatedGridItemContent className="space-y-2">
              <RelatedGridItemTitle className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                {t("tokens:actions.collateral.title")}
              </RelatedGridItemTitle>
              <RelatedGridItemDescription>
                {t("tokens:actions.collateral.description")}
              </RelatedGridItemDescription>
            </RelatedGridItemContent>
            <RelatedGridItemFooter className="pt-6">
              <Button
                variant="secondary"
                size="sm"
                className="press-effect"
                onClick={() => setOpen("collateral")}
              >
                {t("tokens:actions.collateral.submit")}
              </Button>
            </RelatedGridItemFooter>
          </RelatedGridItem>
        )}

        {can.mint && (
          <RelatedGridItem>
            <RelatedGridItemContent className="space-y-2">
              <RelatedGridItemTitle className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                {t("tokens:actions.mint.title")}
              </RelatedGridItemTitle>
              <RelatedGridItemDescription>
                {t("tokens:actions.mint.description")}
              </RelatedGridItemDescription>
            </RelatedGridItemContent>
            <RelatedGridItemFooter className="pt-6">
              <Button
                variant="secondary"
                size="sm"
                className="press-effect"
                onClick={() => setOpen("mint")}
              >
                {t("tokens:actions.mint.label")}
              </Button>
            </RelatedGridItemFooter>
          </RelatedGridItem>
        )}

        {can.burn && (
          <RelatedGridItem>
            <RelatedGridItemContent className="space-y-2">
              <RelatedGridItemTitle className="flex items-center gap-2">
                <Flame className="h-4 w-4" />
                {t("tokens:actions.burn.title")}
              </RelatedGridItemTitle>
              <RelatedGridItemDescription>
                {t("tokens:actions.burn.description")}
              </RelatedGridItemDescription>
            </RelatedGridItemContent>
            <RelatedGridItemFooter className="pt-6">
              <Button
                variant="secondary"
                size="sm"
                className="press-effect"
                onClick={() => setOpen("burn")}
              >
                {t("tokens:actions.burn.label")}
              </Button>
            </RelatedGridItemFooter>
          </RelatedGridItem>
        )}
      </RelatedGridContent>

      <CollateralSheet
        open={open === "collateral"}
        onOpenChange={(o) => setOpen(o ? "collateral" : null)}
        asset={asset}
      />
      <MintSheet
        open={open === "mint"}
        onOpenChange={(o) => setOpen(o ? "mint" : null)}
        asset={asset}
      />
      <BurnSheet
        open={open === "burn"}
        onOpenChange={(o) => setOpen(o ? "burn" : null)}
        asset={asset}
      />
    </RelatedGrid>
  );
}

export default TokenRelatedActions;
