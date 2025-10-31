import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import type { Identity } from "@/orpc/routes/system/identity/routes/identity.read.schema";
import type { Token } from "@/orpc/routes/token/routes/token.read.schema";

type IdentityQueryOptionsFactory<
  TError = unknown,
  TQueryKey extends readonly unknown[] = readonly unknown[],
> = (args: {
  input: { identityId: string };
}) => UseQueryOptions<Identity, TError, Identity, TQueryKey>;

type TokenQueryOptionsFactory<
  TError = unknown,
  TQueryKey extends readonly unknown[] = readonly unknown[],
> = (args: {
  input: { tokenAddress: string };
}) => UseQueryOptions<Token, TError, Token, TQueryKey>;

type UseEntityDisplayDataParams<
  TIdentityError = unknown,
  TIdentityQueryKey extends readonly unknown[] = readonly unknown[],
  TTokenError = unknown,
  TTokenQueryKey extends readonly unknown[] = readonly unknown[],
> = {
  address: string;
  loaderIdentity: Identity;
  loaderToken: Token | null;
  createIdentityQueryOptions: IdentityQueryOptionsFactory<
    TIdentityError,
    TIdentityQueryKey
  >;
  createTokenQueryOptions: TokenQueryOptionsFactory<
    TTokenError,
    TTokenQueryKey
  >;
};

type UseEntityDisplayDataResult = {
  identity: Identity;
  token: Token | null;
  displayName: string;
};

export function useEntityDisplayData<
  TIdentityError = unknown,
  TIdentityQueryKey extends readonly unknown[] = readonly unknown[],
  TTokenError = unknown,
  TTokenQueryKey extends readonly unknown[] = readonly unknown[],
>({
  address,
  loaderIdentity,
  loaderToken,
  createIdentityQueryOptions,
  createTokenQueryOptions,
}: UseEntityDisplayDataParams<
  TIdentityError,
  TIdentityQueryKey,
  TTokenError,
  TTokenQueryKey
>): UseEntityDisplayDataResult {
  const identityQueryOptions = createIdentityQueryOptions({
    input: { identityId: address },
  });

  const { data: queriedIdentity } = useQuery(identityQueryOptions);

  const identity = queriedIdentity ?? loaderIdentity;

  const tokenAddress = identity?.account?.id ?? null;

  const tokenQueryOptions = createTokenQueryOptions({
    input: { tokenAddress: tokenAddress ?? address },
  });

  const isTokenQueryEnabled = tokenAddress !== null;

  const { data: queriedToken } = useQuery({
    ...tokenQueryOptions,
    enabled: isTokenQueryEnabled ? (tokenQueryOptions.enabled ?? true) : false,
  });

  const token = queriedToken ?? loaderToken ?? null;

  const displayName =
    token?.name ??
    identity?.account?.contractName ??
    `${address.slice(0, 6)}…${address.slice(-4)}`;

  return {
    identity,
    token,
    displayName,
  };
}
