import { getEquityDetail } from "@/lib/queries/equity/equity-detail";
import type { Address } from "viem";
import { PauseForm } from "./form";

interface PauseFormWrapperProps {
  address: Address;
}

export async function PauseFormWrapper({ address }: PauseFormWrapperProps) {
  const equity = await getEquityDetail({ address });
  return <PauseForm address={address} isPaused={equity.paused} />;
}
