import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";

type ParticipantStatus = "registered" | "pending" | "pendingRegistration";

type ParticipantStatusTranslationKey =
  | "status.registered"
  | "status.pending"
  | "status.pendingRegistration";

const translationKeyMap: Record<
  ParticipantStatus,
  ParticipantStatusTranslationKey
> = {
  registered: "status.registered",
  pending: "status.pending",
  pendingRegistration: "status.pendingRegistration",
};

interface ParticipantStatusBadgeProps {
  status: ParticipantStatus;
}

/**
 * Shared badge for participant registration state across entity and user tables.
 */
export function ParticipantStatusBadge({
  status,
}: ParticipantStatusBadgeProps) {
  const { t } = useTranslation("participants");
  const label = t(translationKeyMap[status]);
  const variant = status === "registered" ? "default" : "outline";

  return <Badge variant={variant}>{label}</Badge>;
}

export type { ParticipantStatus };
