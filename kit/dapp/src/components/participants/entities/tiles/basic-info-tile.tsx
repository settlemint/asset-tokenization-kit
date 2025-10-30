import { CopyToClipboard } from "@/components/copy-to-clipboard/copy-to-clipboard";
import {
  Tile,
  TileContent,
  TileHeader,
  TileTitle,
} from "@/components/tile/tile";
import { TokenStatusBadge } from "@/components/tokens/token-status-badge";
import type { Identity } from "@/orpc/routes/system/identity/routes/identity.read.schema";
import type { Token } from "@/orpc/routes/token/routes/token.read.schema";
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
  const contractTypeKey = token?.type ?? null;

  const contractTypeLabel = useMemo(() => {
    if (!contractTypeKey) {
      return null;
    }

    return t(`asset-types:types.${contractTypeKey}.name`);
  }, [contractTypeKey, t]);

  const displayName = useMemo(() => {
    if (token?.name) {
      return token.symbol ? `${token.name} (${token.symbol})` : token.name;
    }

    if (identity.account?.contractName) {
      return identity.account.contractName;
    }

    return t("entities:entityTable.fallback.noName");
  }, [identity.account?.contractName, t, token?.name, token?.symbol]);

  const description = useMemo(() => {
    if (contractTypeKey) {
      return t(`asset-types:types.${contractTypeKey}.description`);
    }

    return t("entities:page.description");
  }, [contractTypeKey, contractTypeLabel, t]);

  const contractLabel = t("entities:entityTable.columns.address");

  const identityLabel = t("entities:entityTable.columns.identityAddress");

  const showDescription = Boolean(
    description && description !== contractTypeLabel
  );

  return (
    <Tile>
      <TileHeader className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="flex size-9 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <Building2 className="size-5" aria-hidden="true" />
          </span>
          <div className="space-y-1">
            <TileTitle>{t("entities:details.basicInfo.title")}</TileTitle>
            {contractTypeLabel ? (
              <p className="text-sm font-medium text-muted-foreground">
                {contractTypeLabel}
              </p>
            ) : null}
            {showDescription ? (
              <p className="text-sm text-muted-foreground">{description}</p>
            ) : null}
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
                className="inline-flex w-full flex-wrap items-center gap-2"
              >
                <span
                  className="block w-full truncate rounded-md bg-muted px-3 py-1 font-mono text-sm text-foreground"
                  title={contractAddress}
                >
                  {contractAddress}
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
                className="inline-flex w-full flex-wrap items-center gap-2"
              >
                <span
                  className="block w-full truncate rounded-md bg-muted px-3 py-1 font-mono text-sm text-foreground"
                  title={identityAddress}
                >
                  {identityAddress}
                </span>
              </CopyToClipboard>
            </dd>
          </div>
        </dl>
        <TokenStatusBadge
          paused={paused}
          showIcon={false}
          className="self-start"
        />
      </TileContent>
    </Tile>
  );
}
