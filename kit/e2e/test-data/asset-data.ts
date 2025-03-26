const pincode = "123456";

let sequenceCounter = 0;

const getRandomElement = <T>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)];
};

const getRandomInt = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const getRandomString = (length: number): string => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

const prefixes = [
  "Neo",
  "Astra",
  "Vero",
  "Nova",
  "Nexus",
  "Axia",
  "Quant",
  "Luma",
  "Crest",
  "Velo",
  "Xylo",
  "Vertex",
  "Zenit",
  "Aria",
  "Omni",
  "Pyre",
  "Helix",
  "Syna",
  "Opti",
  "Cirrus",
  "Radia",
  "Meri",
  "Elyx",
  "Orbi",
  "Alpha",
  "Delta",
  "Omega",
  "Sigma",
  "Gamma",
  "Beta",
  "Prime",
  "Core",
  "Volt",
  "Echo",
  "Flux",
  "Grav",
  "Hyper",
  "Ion",
  "Jet",
  "Krypto",
  "Luna",
  "Meta",
  "Nitro",
  "Orbit",
  "Pulse",
  "Ryze",
  "Tect",
  "Ultra",
];

const middles = [
  "tek",
  "sys",
  "cor",
  "dex",
  "nex",
  "tron",
  "flux",
  "gen",
  "max",
  "plex",
  "trix",
  "syn",
  "zar",
  "thon",
  "mex",
  "tics",
  "ium",
  "node",
  "cell",
  "form",
  "path",
  "gram",
  "cast",
  "verse",
  "tech",
  "soft",
  "net",
  "com",
  "ware",
  "data",
  "grid",
  "mind",
  "link",
  "wave",
  "byte",
  "code",
  "edge",
  "forge",
  "hub",
  "logic",
  "med",
  "nano",
  "orbit",
  "pulse",
  "quant",
  "rail",
  "scale",
  "tier",
];

const suffixes = [
  "Global",
  "Capital",
  "Prime",
  "Trust",
  "Partners",
  "Asset",
  "Ventures",
  "Finance",
  "Holdings",
  "Invest",
  "Equity",
  "Reserve",
  "Group",
  "Banking",
  "Securities",
  "Wealth",
  "Alliance",
  "Exchange",
  "Advisors",
  "Management",
  "Fund",
  "Credit",
  "Markets",
  "Financial",
  "Bancorp",
  "Traders",
  "Brokers",
  "Dynamics",
  "Solutions",
  "Enterprises",
  "Institutional",
  "International",
  "Strategies",
  "Associates",
  "Consortium",
  "Mutual",
  "Portfolio",
  "Digital",
];

const bondTerms = ["1Y", "2Y", "3Y", "5Y", "7Y", "10Y", "15Y", "20Y", "30Y"];
const bondTypes = ["Treasury", "Corp", "Municipal", "Sovereign", "High-Yield"];

const fundStrategies = ["Growth", "Value", "Income", "Balanced", "Opportunity"];
const fundAssetClasses = ["Equity", "Fixed Income", "Multi-Asset", "Global"];

const stableCurrencies = ["Dollar", "Euro", "Pound", "Yen", "Franc"];

const depositCurrencies = [
  "Dollar",
  "Euro",
  "Pound",
  "Yen",
  "Franc",
  "Swiss Franc",
  "Yuan",
  "Rupee",
  "Real",
  "Peso",
];

const getUniqueId = (): string => {
  sequenceCounter++;
  return `${sequenceCounter}-${getRandomString(3)}-${getRandomInt(100, 999)}`;
};

export const generateBondName = (): string => {
  const companyName = `${getRandomElement(prefixes)}${getRandomElement(middles)} ${getRandomElement(suffixes)}`;
  const type = getRandomElement(bondTypes);
  const term = getRandomElement(bondTerms);
  const uniqueId = getUniqueId();

  return `${companyName} ${type} ${term} Bond-${uniqueId}`;
};

export const generateCryptoName = (): string => {
  const name = `${getRandomElement(prefixes)}${getRandomElement(middles)}`;
  const uniqueId = getUniqueId();

  return `${name} Token-${uniqueId}`;
};

export const generateEquityName = (): string => {
  const name = `${getRandomElement(prefixes)}${getRandomElement(middles)} ${getRandomElement(suffixes)}`;
  const uniqueId = getUniqueId();

  return `${name} Equity-${uniqueId}`;
};

export const generateFundName = (): string => {
  const manager = `${getRandomElement(prefixes)}${getRandomElement(middles)}`;
  const strategy = getRandomElement(fundStrategies);
  const assetClass = getRandomElement(fundAssetClasses);
  const uniqueId = getUniqueId();

  return `${manager} ${assetClass} ${strategy} Fund-${uniqueId}`;
};

export const generateStablecoinName = (): string => {
  const prefix = getRandomElement(prefixes);
  const currency = getRandomElement(stableCurrencies);
  const uniqueId = getUniqueId();

  return `${prefix}${currency} Stable-${uniqueId}`;
};

export const generateDepositName = (): string => {
  const prefix = getRandomElement(prefixes);
  const currency = getRandomElement(depositCurrencies);
  const uniqueId = getUniqueId();

  return `${prefix}${currency} Tokenized Deposit-${uniqueId}`;
};

const generateSymbol = (name: string): string => {
  const words = name.split(/[\s-]+/);
  let symbol = "";

  for (let i = 0; i < Math.min(5, words.length); i++) {
    if (words[i].length > 0) {
      symbol += words[i][0].toUpperCase();
    }
  }

  symbol += getRandomInt(10, 99).toString();

  return symbol;
};

export const bondData = {
  assetType: "Bond",
  name: generateBondName(),
  symbol: generateSymbol(generateBondName()),
  decimals: "12",
  isin: `US${getRandomInt(1000000000, 9999999999)}`,
  maximumSupply: "1000",
  faceValue: "100",
  valueInEur: "10",
  pincode: pincode,
  sidebarAssetTypes: "Bonds",
  initialSupply: "0",
};

export const cryptocurrencyData = {
  assetType: "Cryptocurrency",
  name: generateCryptoName(),
  symbol: generateSymbol(generateCryptoName()),
  decimals: "6",
  initialSupply: "0",
  valueInEur: "100",
  pincode: pincode,
  sidebarAssetTypes: "Cryptocurrencies",
};

export const equityData = {
  assetType: "Equity",
  name: generateEquityName(),
  symbol: generateSymbol(generateEquityName()),
  isin: `US${getRandomInt(1000000000, 9999999999)}`,
  decimals: "13",
  equityClass: "Common Equity",
  equityCategory: "Communication Services",
  valueInEur: "35",
  pincode: pincode,
  sidebarAssetTypes: "Equities",
  initialSupply: "0",
};

export const fundData = {
  assetType: "Fund",
  name: generateFundName(),
  symbol: generateSymbol(generateFundName()),
  isin: `US${getRandomInt(1000000000, 9999999999)}`,
  decimals: "0",
  fundCategory: "Fund of Funds",
  fundClass: "Diversified",
  managementFee: "2",
  valueInEur: "135",
  pincode: pincode,
  sidebarAssetTypes: "Funds",
  initialSupply: "0",
};

export const stablecoinData = {
  assetType: "Stablecoin",
  name: generateStablecoinName(),
  symbol: generateSymbol(generateStablecoinName()),
  decimals: "16",
  validityPeriod: "600",
  valueInEur: "3",
  pincode: pincode,
  sidebarAssetTypes: "Stablecoins",
  initialSupply: "0",
};

export const depositData = {
  assetType: "Tokenized Deposits",
  name: generateDepositName(),
  symbol: generateSymbol(generateDepositName()),
  isin: `US${getRandomInt(1000000000, 9999999999)}`,
  decimals: "16",
  validityPeriod: "600",
  valueInEur: "3",
  pincode: pincode,
  sidebarAssetTypes: "Tokenized Deposits",
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
