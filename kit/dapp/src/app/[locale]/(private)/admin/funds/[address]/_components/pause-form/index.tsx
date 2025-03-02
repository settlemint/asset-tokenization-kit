import { getFundDetail } from "@/lib/queries/fund/fund-detail";
import type { Address } from "viem";
import { PauseForm } from "./form";

interface PauseFormWrapperProps {
  address: Address;
}

export async function PauseFormWrapper({ address }: PauseFormWrapperProps) {
  const fund = await getFundDetail({ address });
  return <PauseForm address={address} isPaused={fund.paused} />;
}
