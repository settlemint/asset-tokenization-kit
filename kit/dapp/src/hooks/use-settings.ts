import type { SettingKey } from "@/lib/zod/validators/settings-key";
import { orpc } from "@/orpc/orpc-client";
import type { SettingsUpsertInput } from "@/orpc/routes/settings/routes/settings.upsert.schema";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

/**
 * Custom hook for managing application settings.
 *
 * Provides a tuple similar to React's useState but backed by the settings API.
 * The hook automatically handles loading states, caching, and cache invalidation.
 * @param key - The setting key to manage
 * @returns A tuple containing the current setting value and a setter function
 * @example
 * ```typescript
 * const [systemAddress, setSystemAddress] = useSettings("SYSTEM_ADDRESS");
 *
 * // Read the value
 * console.log(systemAddress); // "0x..."
 *
 * // Update the value
 * setSystemAddress("0x1234...");
 * ```
 */
export function useSettings(
  key: SettingKey
): [string | null, (value: string) => void, () => void] {
  const queryClient = useQueryClient();

  // Query for the current setting value
  const { data: setting } = useQuery(
    orpc.settings.read.queryOptions({
      input: { key },
    })
  );

  // Mutation for updating the setting
  const { mutate: updateSetting } = useMutation(
    orpc.settings.upsert.mutationOptions({
      onSuccess: () => {
        // Invalidate the specific setting query
        void queryClient.invalidateQueries({
          queryKey: orpc.settings.read.key({
            input: { key },
          }),
          refetchType: "all",
        });
      },
    })
  );

  // Setter function that wraps the mutation
  const setSetting = (value: string) => {
    updateSetting({ key, value } as SettingsUpsertInput);
  };

  const invalidateSetting = () => {
    void queryClient.invalidateQueries({
      queryKey: orpc.settings.read.key({ input: { key } }),
    });
  };

  // Return the current value (or null if not set) and the setter
  return [setting ?? null, setSetting, invalidateSetting];
}
