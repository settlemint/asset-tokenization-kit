import { useQuery, type UseQueryOptions } from "@tanstack/react-query";

type AccountRecord = {
  account?: {
    id?: string | null;
    contractName?: string | null;
  } | null;
} | null;

type TokenRecord = {
  name?: string | null;
  type?: string | null;
} | null;

type IdentityQueryOptionsFactory = (args: {
  input: { identityId: string };
}) => UseQueryOptions<AccountRecord, unknown, AccountRecord>;

type TokenQueryOptionsFactory = (args: {
  input: { tokenAddress: string };
}) => UseQueryOptions<TokenRecord, unknown, TokenRecord>;

type UseEntityDisplayDataParams = {
  address: string;
  loaderIdentity: AccountRecord;
  loaderToken: TokenRecord;
  createIdentityQueryOptions: IdentityQueryOptionsFactory;
  createTokenQueryOptions: TokenQueryOptionsFactory;
};

type UseEntityDisplayDataResult = {
  identity: AccountRecord;
  token: TokenRecord;
  displayName: string;
};

export function useEntityDisplayData({
  address,
  loaderIdentity,
  loaderToken,
  createIdentityQueryOptions,
  createTokenQueryOptions,
}: UseEntityDisplayDataParams): UseEntityDisplayDataResult {
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
