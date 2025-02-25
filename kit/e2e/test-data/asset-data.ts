const date = new Date().toISOString().replace(/(\d{4}-\d{1,2}-\d{1,2}).*/u, '$1');
const randomValue = (Math.floor(Math.random() * 10_000) + 10_000).toString().slice(1);
const pincode = '123456';

export const bondData = {
  assetType: 'Bond',
  name: `Test Bond ${date}-${randomValue}`,
  symbol: 'TBOND',
  decimals: '18',
  isin: 'US1234567890',
  cap: '1000',
  faceValueCurrency: 'JBC',
  faceValue: '100',
  couponRate: '10',
  paymentFrequency: 'Monthly',
  pincode: pincode,
};

export const cryptocurrencyData = {
  assetType: 'Cryptocurrency',
  name: `Test Cryptocurrency ${date}-${randomValue}`,
  symbol: 'TCCUR',
  initialSupply: '1000000',
  pincode: pincode,
  sidebarAssetTypes: 'Cryptocurrencies',
};

export const equityData = {
  assetType: 'Equity',
  name: `Test Equity ${date}-${randomValue}`,
  symbol: 'TEQUITY',
  isin: 'US1234567890',
  equityClass: 'Test Common',
  equityCategory: 'Test Equity',
  pincode: pincode,
  sidebarAssetTypes: 'Equities',
  initialSupply: '0',
};

export const fundData = {
  assetType: 'Fund',
  name: `Test Fund ${date}-${randomValue}`,
  symbol: 'TFUND',
  isin: 'US1234567890',
  fundCategory: 'Fund of Funds',
  fundClass: 'Regional',
  managementFee: '2',
  pincode: pincode,
  sidebarAssetTypes: 'Funds',
  initialSupply: '0',
};

export const stablecoinData = {
  assetType: 'Stablecoin',
  name: `Test Stablecoin ${date}-${randomValue}`,
  symbol: 'TSTABLE',
  isin: 'US1234567890',
  collateralProofValidityDuration: 'One year',
  pincode: pincode,
  sidebarAssetTypes: 'Stablecoins',
  initialSupply: '0',
};

export const stableCoinUpdateProvenCollateralData = {
  amount: '1000000',
  pincode: pincode,
};

export const stableCoinMintTokenData = {
  amount: '999000',
  pincode: pincode,
};

export const stableCoinTransferData = {
  transferAmount: '100000',
  pincode: pincode,
};
