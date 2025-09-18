import { BurnSheet } from "@/components/manage-dropdown/sheets/burn-sheet";
import { CollateralSheet } from "@/components/manage-dropdown/sheets/collateral-sheet";
import { MatureConfirmationSheet } from "@/components/manage-dropdown/sheets/mature-confirmation-sheet";
import { MintSheet } from "@/components/manage-dropdown/sheets/mint-sheet";
import { PauseUnpauseConfirmationSheet } from "@/components/manage-dropdown/sheets/pause-unpause-confirmation-sheet";
import { SetCapSheet } from "@/components/manage-dropdown/sheets/set-cap-sheet";
import { SetYieldScheduleSheet } from "@/components/manage-dropdown/sheets/set-yield-schedule-sheet";
import { Button } from "@/components/ui/button";
import type { Token } from "@/orpc/routes/token/routes/token.read.schema";
import { AssetExtensionEnum } from "@atk/zod/asset-extensions";
import { isAfter } from "date-fns";
import {
  CheckCircle,
  Flame,
  Pause,
  Play,
  Plus,
  Shield,
  TrendingUp,
} from "lucide-react";
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

type ActionKey =
  | "collateral"
  | "mint"
  | "burn"
  | "setYieldSchedule"
  | "mature"
  | "pause"
  | "unpause"
  | "setCap";

export function TokenRelatedActions({ asset }: TokenRelatedActionsProps) {
  const { t } = useTranslation(["tokens"]);
  const [open, setOpen] = useState<ActionKey | null>(null);

  const isPaused = asset.pausable?.paused ?? false;

  const can = useMemo(
    () => ({
      collateral:
        asset.userPermissions?.actions?.updateCollateral === true ||
        asset.extensions?.includes(AssetExtensionEnum.COLLATERAL) === true,
      mint: (asset.userPermissions?.actions?.mint ?? false) && !isPaused,
      burn: (asset.userPermissions?.actions?.burn ?? false) && !isPaused,
      setYieldSchedule:
        asset.extensions?.includes(AssetExtensionEnum.YIELD) === true &&
        !asset.yield?.schedule &&
        (asset.userPermissions?.actions?.setYieldSchedule ?? false) &&
        !isPaused,
      mature:
        asset.extensions?.includes(AssetExtensionEnum.BOND) === true &&
        !!asset.bond &&
        !asset.bond.isMatured &&
        !!asset.bond.maturityDate &&
        isAfter(new Date(), asset.bond.maturityDate) &&
        (asset.userPermissions?.actions?.mature ?? false) &&
        !isPaused,
      pause: (asset.userPermissions?.actions?.pause ?? false) && !isPaused,
      unpause: (asset.userPermissions?.actions?.unpause ?? false) && isPaused,
      setCap:
        asset.extensions?.includes(AssetExtensionEnum.CAPPED) === true &&
        (asset.userPermissions?.actions?.setCap ?? false) &&
        !isPaused,
    }),
    [asset, isPaused]
  );

  // Build prioritized actions and ensure we render max 3
  const items = useMemo(() => {
    const arr: Array<{
      key: ActionKey;
      title: string;
      description: string;
      cta: string;
      icon: React.ComponentType<{ className?: string }>;
    }> = [];

    // Prioritize Bond-specific first
    if (can.setYieldSchedule)
      arr.push({
        key: "setYieldSchedule",
        title: t("tokens:related.increase-supply.title.bonds"),
        description: t("tokens:related.increase-supply.description.bonds"),
        cta: t("tokens:actions.setYieldSchedule.submit"),
        icon: TrendingUp,
      });
    if (can.mature)
      arr.push({
        key: "mature",
        title: t("tokens:related.decrease-supply.title.bonds"),
        description: t("tokens:related.decrease-supply.description.bonds"),
        cta: t("tokens:actions.mature.submit"),
        icon: CheckCircle,
      });

    // Core supply actions
    if (can.collateral)
      arr.push({
        key: "collateral",
        title: t("tokens:related.update-collateral.title"),
        description: t(
          "tokens:related.update-collateral.description.stablecoins"
        ),
        cta: t("tokens:actions.collateral.submit"),
        icon: Shield,
      });
    if (can.mint)
      arr.push({
        key: "mint",
        title: t("tokens:related.increase-supply.title.stablecoins"),
        description: t(
          "tokens:related.increase-supply.description.stablecoins"
        ),
        cta: t("tokens:actions.mint.label"),
        icon: Plus,
      });
    if (can.burn)
      arr.push({
        key: "burn",
        title: t("tokens:related.decrease-supply.title.stablecoins"),
        description: t(
          "tokens:related.decrease-supply.description.stablecoins"
        ),
        cta: t("tokens:actions.burn.label"),
        icon: Flame,
      });
    if (can.setCap)
      arr.push({
        key: "setCap",
        title: t("tokens:actions.setCap.title"),
        description: t("tokens:actions.setCap.description"),
        cta: t("tokens:actions.setCap.submit"),
        icon: TrendingUp,
      });

    // Operational actions as fallbacks to fill to 3
    if (can.pause)
      arr.push({
        key: "pause",
        title: t("tokens:actions.pause.label"),
        description: t("tokens:actions.pause.description"),
        cta: t("tokens:actions.pause.submit"),
        icon: Pause,
      });
    if (can.unpause)
      arr.push({
        key: "unpause",
        title: t("tokens:actions.unpause.label"),
        description: t("tokens:actions.unpause.description"),
        cta: t("tokens:actions.unpause.submit"),
        icon: Play,
      });

    return arr.slice(0, 3);
  }, [can, t]);

  if (items.length === 0) return null;

  return (
    <RelatedGrid className="space-y-4">
      <RelatedGridContent columns={3} animate>
        {items.map((a) => (
          <RelatedGridItem key={a.key}>
            <RelatedGridItemContent className="space-y-2">
              <RelatedGridItemTitle className="flex items-center gap-2">
                <a.icon className="h-4 w-4" />
                {a.title}
              </RelatedGridItemTitle>
              <RelatedGridItemDescription>
                {a.description}
              </RelatedGridItemDescription>
            </RelatedGridItemContent>
            <RelatedGridItemFooter className="pt-6">
              <Button
                variant="secondary"
                size="sm"
                className="press-effect"
                onClick={() => setOpen(a.key)}
              >
                {a.cta}
              </Button>
            </RelatedGridItemFooter>
          </RelatedGridItem>
        ))}
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
      <SetYieldScheduleSheet
        open={open === "setYieldSchedule"}
        onOpenChange={(o) => setOpen(o ? "setYieldSchedule" : null)}
        asset={asset}
      />
      <MatureConfirmationSheet
        open={open === "mature"}
        onOpenChange={(o) => setOpen(o ? "mature" : null)}
        asset={asset}
      />
      <PauseUnpauseConfirmationSheet
        open={open === (isPaused ? "unpause" : "pause")}
        onOpenChange={(o) =>
          setOpen(o ? (isPaused ? "unpause" : "pause") : null)
        }
        asset={asset}
      />
      <SetCapSheet
        open={open === "setCap"}
        onOpenChange={(o) => setOpen(o ? "setCap" : null)}
        asset={asset}
      />
    </RelatedGrid>
  );
}

export default TokenRelatedActions;
