import type { SystemAddonType } from "@/orpc/routes/system/addon/routes/addon.create.schema";
import type { LucideIcon } from "lucide-react";
import { Globe, Package, PiggyBank } from "lucide-react";

/**
 * Mapping of system addon types to their corresponding Lucide icons.
 * Extend this object as new addon types are introduced.
 */
export const addonIcons: Record<SystemAddonType, LucideIcon> = {
  airdrops: Package, // Represents distribution, "Package" is a good metaphor for airdrops
  yield: PiggyBank, // PiggyBank best represents yield/returns
  xvp: Globe, // Globe is appropriate for cross-venue/platform
};

/**
 * Returns the Lucide icon component for a given system addon type.
 * Falls back to the generic Package icon if the type is unrecognized.
 *
 * @param addonType - The system addon type string
 * @returns LucideIcon component
 */
export const getAddonIcon = (addonType: SystemAddonType) => {
  return addonType in addonIcons ? addonIcons[addonType] : Package;
};
