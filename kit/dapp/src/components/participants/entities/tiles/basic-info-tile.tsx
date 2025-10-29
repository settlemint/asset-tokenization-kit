import {
  Tile,
  TileContent,
  TileFooter,
  TileHeader,
  TileTitle,
} from "@/components/tile/tile";
import { CopyToClipboard } from "@/components/copy-to-clipboard/copy-to-clipboard";
import type { Identity } from "@/orpc/routes/system/identity/routes/identity.read.schema";
import type { Token } from "@/orpc/routes/token/routes/token.read.schema";
import { TokenStatusBadge } from "@/components/tokens/token-status-badge";
import { Building2 } from "lucide-react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

type EntityBasicInfoTileProps = {
  identity: Identity;
  token?: Token | null;
};

export function BasicInfoTile({ identity, token }: EntityBasicInfoTileProps) {
  const { t } = useTranslation(["entities", "asset-types", "tokens", "common"]);

  const contractAddress = identity.account?.id ?? identity.id;
  const identityAddress = identity.id;
  const paused = token?.pausable?.paused ?? false;

  const displayName = useMemo(() => {
    if (token?.name) {
      return token.symbol ? `${token.name} (${token.symbol})` : token.name;
    }

    if (identity.account?.contractName) {
      return identity.account.contractName;
    }

    return t("entities:entityTable.fallback.noName", {
      defaultValue: "Unnamed",
    });
  }, [identity.account.contractName, t, token?.name, token?.symbol]);

  const description = useMemo(() => {
    if (token?.type) {
      return t(`asset-types.types.${token.type}.description`, {
        defaultValue: token.type,
      });
    }

    return t("entities:page.description", {
      defaultValue: "Entity managed through the platform",
    });
  }, [t, token?.type]);

  const contractLabel = t("entities:entityTable.columns.address", {
    defaultValue: "Contract Address",
  });

  const identityLabel = t("entities:entityTable.columns.identityAddress", {
    defaultValue: "Identity Address",
  });

  const formatAddress = (value: string) =>
    value.length <= 12 ? value : `${value.slice(0, 6)}…${value.slice(-4)}`;

  return (
    <Tile>
      <TileHeader>
        <div className="flex items-start gap-3">
          <span className="flex size-9 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <Building2 className="size-5" aria-hidden="true" />
          </span>
          <div className="space-y-1">
            <TileTitle>
              {t("entities:details.basicInfo.title", {
                defaultValue: "Basic Info",
              })}
            </TileTitle>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
      </TileHeader>
      <TileContent className="gap-4">
        <div className="space-y-1">
          <p className="text-lg font-semibold leading-tight">{displayName}</p>
        </div>
        <dl className="space-y-3">
          <div className="flex flex-col gap-1">
            <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {contractLabel}
            </dt>
            <dd>
              <CopyToClipboard
                value={contractAddress}
                className="inline-flex items-center gap-2"
              >
                <span className="rounded-md bg-muted px-3 py-1 font-mono text-sm text-foreground">
                  {formatAddress(contractAddress)}
                </span>
              </CopyToClipboard>
            </dd>
          </div>
          <div className="flex flex-col gap-1">
            <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {identityLabel}
            </dt>
            <dd>
              <CopyToClipboard
                value={identityAddress}
                className="inline-flex items-center gap-2"
              >
                <span className="rounded-md bg-muted px-3 py-1 font-mono text-sm text-foreground">
                  {formatAddress(identityAddress)}
                </span>
              </CopyToClipboard>
            </dd>
          </div>
        </dl>
      </TileContent>
      <TileFooter className="justify-start border-0 p-0">
        <TokenStatusBadge paused={paused} showIcon={false} />
      </TileFooter>
    </Tile>
  );
}
