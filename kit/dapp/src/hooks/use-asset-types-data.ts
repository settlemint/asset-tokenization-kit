import { orpc } from "@/orpc/orpc-client";
import { getAssetTypeFromFactoryTypeId } from "@atk/zod/asset-types";
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

  // Check if user can create asset types
  const canCreateAssetFactory =
    systemDetails?.userPermissions?.actions.tokenFactoryCreate ?? false;

  // Create a set of already deployed asset types for easy lookup
  const deployedAssetTypes = useMemo(() => {
    const factories = systemDetails?.tokenFactoryRegistry.tokenFactories ?? [];
    return new Set(
      factories.map((factory) => getAssetTypeFromFactoryTypeId(factory.typeId))
    );
  }, [systemDetails?.tokenFactoryRegistry.tokenFactories]);

  return {
    systemDetails,
    canCreateAssetFactory,
    deployedAssetTypes,
    isLoading: isLoading,
    isError: systemError,
  };
}
