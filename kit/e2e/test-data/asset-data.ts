const date = new Date()
  .toISOString()
  .replace(/(\d{4}-\d{1,2}-\d{1,2}).*/u, "$1");
const randomValue = (Math.floor(Math.random() * 10_000) + 10_000)
  .toString()
  .slice(1);
const pincode = "123456";

export const bondData = {
  assetType: "Bond",
  name: `Test Bond ${date}-${randomValue}`,
  symbol: "TBOND",
  decimals: "18",
  isin: "US1234567890",
  maximumSupply: "1000",
  faceValue: "100",
  pincode: pincode,
  sidebarAssetTypes: "Bonds",
  initialSupply: "0",
};

export const cryptocurrencyData = {
  assetType: "Cryptocurrency",
  name: `Test Cryptocurrency ${date}-${randomValue}`,
  symbol: "TCCUR",
  initialSupply: "0",
  pincode: pincode,
  sidebarAssetTypes: "Cryptocurrencies",
};

export const equityData = {
  assetType: "Equity",
  name: `Test Equity ${date}-${randomValue}`,
  symbol: "TEQUITY",
  isin: "US1234567890",
  equityClass: "Common Equity",
  equityCategory: "Communication Services",
  pincode: pincode,
  sidebarAssetTypes: "Equities",
  initialSupply: "0",
};

export const fundData = {
  assetType: "Fund",
  name: `Test Fund ${date}-${randomValue}`,
  symbol: "TFUND",
  isin: "US1234567890",
  fundCategory: "Fund of Funds",
  fundClass: "Regional",
  managementFee: "2",
  pincode: pincode,
  sidebarAssetTypes: "Funds",
  initialSupply: "0",
};

export const stablecoinData = {
  assetType: "Stablecoin",
  name: `Test Stablecoin ${date}-${randomValue}`,
  symbol: "TSTABLE",
  isin: "US1234567890",
  validityPeriod: "600",
  pincode: pincode,
  sidebarAssetTypes: "Stablecoins",
  initialSupply: "0",
};

export const stableCoinUpdateCollateralData = {
  amount: "10000",
  pincode: pincode,
};

export const stableCoinMintTokenData = {
  amount: "10000",
  pincode: pincode,
};

export const stableCoinTransferData = {
  transferAmount: "1000",
  pincode: pincode,
};
