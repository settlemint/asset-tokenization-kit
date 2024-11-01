// TODO: we should allow the issuer to run Dutch auctions to get their
// tokens in the market. Dutch Auction: Price starts high and decreases over
// time until buyers are willing to buy. see maurelian/dutch-auction
//
// We should also allow fixed flat pricing, see hsinhoyeh/ico

export default function UserPortfolio() {
  return (
    <>
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Buy tokens</h2>
      </div>
    </>
  );
}
