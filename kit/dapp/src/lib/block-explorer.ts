export function getBlockExplorerUrl(explorerUrl?: string) {
  return explorerUrl ?? process.env.NEXT_PUBLIC_EXPLORER_URL ?? null;
}

function createExplorerUrl(path: string, explorerUrl?: string): string | null {
  const baseUrl = getBlockExplorerUrl(explorerUrl);
  return baseUrl ? `${baseUrl}${path}` : null;
}

export function getBlockExplorerAllTxUrl(explorerUrl?: string) {
  return createExplorerUrl("/transactions", explorerUrl);
}

export function getBlockExplorerTxUrl(hash: string, explorerUrl?: string) {
  return createExplorerUrl(`tx/${hash}`, explorerUrl);
}

export function getBlockExplorerAddressUrl(
  address: string,
  explorerUrl?: string
) {
  return createExplorerUrl(`address/${address}`, explorerUrl);
}
