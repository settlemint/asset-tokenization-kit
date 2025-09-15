import { orpc } from "@/orpc/orpc-client";
import {
  type AssetFactoryTypeId,
  getAssetTypeFromFactoryTypeId,
} from "@atk/zod/asset-types";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

export function useAssetTypesData() {
  // Fetch system details to see which asset types are deployed
  const {
    data: systemDetails,
    isLoading,
    isError: systemError,
  } = useQuery(
    orpc.system.read.queryOptions({
      input: { id: "default" },
    })
  );

  // Get current user data with roles
  const {
    data: user,
    isLoading: isUserLoading,
    isError: userError,
  } = useQuery(orpc.user.me.queryOptions());

  // Check if user has system manager role for enabling asset types
  // Only set to true if user data is loaded and user has the role
  const hasSystemManagerRole = !isUserLoading && !!user?.roles?.systemManager;

  // Create a set of already deployed asset types for easy lookup
  const deployedAssetTypes = useMemo(
    () =>
      new Set(
        systemDetails?.tokenFactories.map((factory) =>
          getAssetTypeFromFactoryTypeId(factory.typeId as AssetFactoryTypeId)
        ) ?? []
      ),
    [systemDetails?.tokenFactories]
  );

  return {
    systemDetails,
    user,
    hasSystemManagerRole,
    deployedAssetTypes,
    isLoading: isLoading || isUserLoading,
    isError: systemError || userError,
  };
}
