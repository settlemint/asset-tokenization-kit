import { orpc } from "@/orpc/orpc-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";

export function useRegisterIdentity(identityId: string, onDone: () => void) {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation(
    orpc.system.identity.register.mutationOptions({
      onSuccess: async (_, variables) => {
        const invalidationPromises = [
          queryClient.invalidateQueries({
            queryKey: orpc.system.identity.read.queryKey({
              input: { identityId },
            }),
          }),
          queryClient.invalidateQueries({
            queryKey: orpc.system.read.queryKey({ input: { id: "default" } }),
          }),
        ];

        if (variables.wallet) {
          invalidationPromises.push(
            queryClient.invalidateQueries({
              queryKey: orpc.system.identity.read.queryKey({
                input: { wallet: variables.wallet },
              }),
            })
          );
        }

        await Promise.all(invalidationPromises);
        await router.invalidate();
        onDone();
      },
    })
  );
}
