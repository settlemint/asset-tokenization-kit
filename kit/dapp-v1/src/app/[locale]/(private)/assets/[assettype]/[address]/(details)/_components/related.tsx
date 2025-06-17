import { getAssetBalanceDetail } from "@/lib/queries/asset-balance/asset-balance-detail";
import { getAssetDetail } from "@/lib/queries/asset-detail";
import { getAssetUsersDetail } from "@/lib/queries/asset/asset-users-detail";
import type { getDepositDetail } from "@/lib/queries/deposit/deposit-detail";
import type { getStableCoinDetail } from "@/lib/queries/stablecoin/stablecoin-detail";
import type { AssetType } from "@/lib/utils/typebox/asset-types";
import { Suspense } from "react";
import type { Address } from "viem";
import { BondsRelated } from "./related/bonds";
import { CryptocurrenciesRelated } from "./related/cryptocurrencies";
import { DepositsRelated } from "./related/deposits";
import { EquitiesRelated } from "./related/equities";
import { FundsRelated } from "./related/funds";
import { StablecoinsRelated } from "./related/stablecoins";

interface RelatedProps {
  assettype: AssetType;
  address: Address;
  assetDetails: Awaited<ReturnType<typeof getAssetDetail>>;
  userBalance: Awaited<ReturnType<typeof getAssetBalanceDetail>>;
  assetUsersDetails?: Awaited<ReturnType<typeof getAssetUsersDetail>>;
  currentUserWallet?: Address;
}

export function Related({
  assettype,
  address,
  assetDetails,
  userBalance,
  assetUsersDetails,
  currentUserWallet,
}: RelatedProps) {
  switch (assettype) {
    case "bond":
      return (
        <Suspense>
          <BondsRelated
            address={address}
            assetDetails={assetDetails}
            userBalance={userBalance}
            assetUsersDetails={assetUsersDetails}
            currentUserWallet={currentUserWallet}
          />
        </Suspense>
      );
    case "cryptocurrency":
      return (
        <Suspense>
          <CryptocurrenciesRelated
            address={address}
            assetDetails={assetDetails}
            userBalance={userBalance}
            assetUsersDetails={assetUsersDetails}
            currentUserWallet={currentUserWallet}
          />
        </Suspense>
      );
    case "stablecoin":
      return (
        <Suspense>
          <StablecoinsRelated
            address={address}
            assetDetails={
              assetDetails as Awaited<ReturnType<typeof getStableCoinDetail>>
            }
            userBalance={userBalance}
            assetUsersDetails={assetUsersDetails}
            currentUserWallet={currentUserWallet}
          />
        </Suspense>
      );
    case "deposit":
      return (
        <Suspense>
          <DepositsRelated
            address={address}
            assetDetails={
              assetDetails as Awaited<ReturnType<typeof getDepositDetail>>
            }
            userBalance={userBalance}
            assetUsersDetails={assetUsersDetails}
            currentUserWallet={currentUserWallet}
          />
        </Suspense>
      );
    case "equity":
      return (
        <Suspense>
          <EquitiesRelated
            address={address}
            assetDetails={assetDetails}
            userBalance={userBalance}
            assetUsersDetails={assetUsersDetails}
            currentUserWallet={currentUserWallet}
          />
        </Suspense>
      );
    case "fund":
      return (
        <Suspense>
          <FundsRelated
            address={address}
            assetDetails={assetDetails}
            userBalance={userBalance}
            assetUsersDetails={assetUsersDetails}
            currentUserWallet={currentUserWallet}
          />
        </Suspense>
      );
    default:
      throw new Error("Invalid asset type");
  }
}
