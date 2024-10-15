import { useSuspenseQuery } from "@tanstack/react-query";
import { type GravatarOptions, getGravatarUrl } from "react-awesome-gravatar";
import { http, type Address, createPublicClient } from "viem";
import { mainnet } from "viem/chains";

const defaultAvatarOptions: GravatarOptions = {
  default: "identicon",
  size: 400,
};

export function useAvatar({ email, address }: { email?: string | null; address?: string | null }) {
  const { data } = useSuspenseQuery({
    queryKey: ["avatar", email, address],
    queryFn: async () => {
      if (address) {
        const publicClient = createPublicClient({
          chain: mainnet,
          transport: http(),
        });

        const ensName = await publicClient.getEnsName({
          address: address as Address,
        });

        if (ensName) {
          return { ensName, avatar: `https://metadata.ens.domains/mainnet/avatar/${ensName}` };
        }
      }
      if (email) {
        const avatarUrl = getGravatarUrl(email ?? "", defaultAvatarOptions);

        return { avatar: avatarUrl };
      }
      return null;
    },
  });

  return data;
}
