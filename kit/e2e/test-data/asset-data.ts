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

const limitNameLength = (name: string, maxLength: number = 50): string => {
  if (name.length <= maxLength) {
    return name;
  }
  const lastSpaceIndex = name.lastIndexOf(" ", maxLength - 10);

  if (lastSpaceIndex === -1) {
    return name.substring(0, maxLength);
  }

  const lastDashIndex = name.lastIndexOf("-");
  const uniqueId = lastDashIndex !== -1 ? name.substring(lastDashIndex) : "";

  return name.substring(0, lastSpaceIndex) + uniqueId;
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
const bondTypes = ["TR", "Corp", "Muni", "SOV", "HY"];

const fundStrategies = ["Growth", "Value", "Income", "Balanced", "Opp"];
const fundAssetClasses = ["Equity", "Fixed", "Multi", "Global"];

const stableCurrencies = ["USD", "EUR", "GBP", "JPY", "CHF"];

const depositCurrencies = [
  "USD",
  "EUR",
  "GBP",
  "JPY",
  "CHF",
  "CNY",
  "INR",
  "BRL",
  "MXN",
];

const getUniqueId = (): string => {
  sequenceCounter++;
  return `${sequenceCounter}-${getRandomString(2)}-${getRandomInt(10, 99)}`;
};

const generateValidISIN = (countryCode: string = "US"): string => {
  const securityId =
    getRandomString(3) + getRandomInt(100000, 999999).toString();

  const baseISIN = countryCode + securityId;

  const checkDigit = calculateISINCheckDigit(baseISIN);

  return baseISIN + checkDigit;
};

const calculateISINCheckDigit = (isinWithoutCheckDigit: string): string => {
  let digits = "";
  for (let i = 0; i < isinWithoutCheckDigit.length; i++) {
    const char = isinWithoutCheckDigit[i];
    if (char >= "A" && char <= "Z") {
      digits += (char.charCodeAt(0) - "A".charCodeAt(0) + 10).toString();
    } else {
      digits += char;
    }
  }

  let sum = 0;
  let isEven = true;

  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits[i]);

    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit = Math.floor(digit / 10) + (digit % 10);
      }
    }

    sum += digit;
    isEven = !isEven;
  }

  const checkDigit = (10 - (sum % 10)) % 10;
  return checkDigit.toString();
};

export const generateBondName = (): string => {
  const companyName = `${getRandomElement(prefixes)}${getRandomElement(middles)}`;
  const type = getRandomElement(bondTypes);
  const term = getRandomElement(bondTerms);
  const uniqueId = getUniqueId();

  return limitNameLength(`${companyName} ${type} ${term}-${uniqueId}`);
};

export const generateCryptoName = (): string => {
  const name = `${getRandomElement(prefixes)}${getRandomElement(middles)}`;
  const uniqueId = getUniqueId();

  return limitNameLength(`${name}-${uniqueId}`);
};

export const generateEquityName = (): string => {
  const name = `${getRandomElement(prefixes)}${getRandomElement(middles)}`;
  const uniqueId = getUniqueId();

  return limitNameLength(`${name} Eq-${uniqueId}`);
};

export const generateFundName = (): string => {
  const manager = `${getRandomElement(prefixes)}${getRandomElement(middles)}`;
  const strategy = getRandomElement(fundStrategies);
  const uniqueId = getUniqueId();

  return limitNameLength(`${manager} ${strategy}-${uniqueId}`);
};

export const generateStablecoinName = (): string => {
  const prefix = getRandomElement(prefixes);
  const currency = getRandomElement(stableCurrencies);
  const uniqueId = getUniqueId();

  return limitNameLength(`${prefix}${currency}-${uniqueId}`);
};

export const generateDepositName = (): string => {
  const prefix = getRandomElement(prefixes);
  const currency = getRandomElement(depositCurrencies);
  const uniqueId = getUniqueId();

  return limitNameLength(`${prefix}${currency} Dep-${uniqueId}`);
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

export function generateFutureDateTimeString(hoursToAdd: number = 24): string {
  const now = new Date();
  now.setHours(now.getHours() + hoursToAdd);

  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, "0");
  const day = now.getDate().toString().padStart(2, "0");
  const hours = now.getHours().toString().padStart(2, "0");
  const minutes = now.getMinutes().toString().padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export const bondData = {
  assetType: "Bond",
  name: generateBondName(),
  symbol: generateSymbol(generateBondName()),
  isin: generateValidISIN("US"),
  internalId: getUniqueId().substring(0, 12),
  decimals: "18",
  maximumSupply: "1000",
  faceValue: "100",
  pincode: pincode,
  sidebarAssetTypes: "Bonds",
  initialSupply: "0",
};

export const cryptocurrencyData = {
  assetType: "Cryptocurrency",
  name: generateCryptoName(),
  symbol: generateSymbol(generateCryptoName()),
  isin: `US${getRandomInt(1000000000, 9999999999)}`,
  internalId: getUniqueId().substring(0, 12),
  decimals: "6",
  initialSupply: "100",
  price: "10",
  pincode: pincode,
  sidebarAssetTypes: "Cryptocurrencies",
};

export const cryptocurrencyMintData = {
  amount: "100",
  pincode: pincode,
};

export const cryptocurrencyDataAmountAfterMint = {
  amount: "200",
};

export const cryptocurrencyTransferData = {
  transferAmount: "100",
  pincode: pincode,
};

export const cryptocurrencyBurnData = {
  amount: "50",
  pincode: pincode,
};

export const equityMintData = {
  amount: "1500",
  pincode: pincode,
};

export const equityTransferData = {
  transferAmount: "500",
  pincode: pincode,
};

export const equityBurnData = {
  amount: "600",
  pincode: pincode,
};

export const fundMintData = {
  amount: "10000",
  pincode: pincode,
};

export const fundTransferData = {
  transferAmount: "1000",
  pincode: pincode,
};

export const fundBurnData = {
  amount: "1000",
  pincode: pincode,
};

export const stablecoinData = {
  assetType: "Stablecoin",
  name: generateStablecoinName(),
  symbol: generateSymbol(generateStablecoinName()),
  isin: generateValidISIN("US"),
  decimals: "16",
  country: "United States of America",
  pincode: pincode,
  sidebarAssetTypes: "Stablecoins",
};

export const fundData = {
  assetType: "Fund",
  name: generateFundName(),
  symbol: generateSymbol(generateFundName()),
  isin: generateValidISIN("EG"),
  decimals: "3",
  country: "Egypt",
  basePrice: "100",
  managementFee: "2",
  price: "100",
  fundCategory: "Growth",
  fundClass: "Institutional",
  initialSupply: "0",
  pincode: pincode,
  sidebarAssetTypes: "Funds",
};

export const equityData = {
  assetType: "Equity",
  name: generateEquityName(),
  symbol: generateSymbol(generateEquityName()),
  isin: generateValidISIN("RS"),
  decimals: "12",
  country: "Serbia",
  pincode: pincode,
  sidebarAssetTypes: "Equities",
};

export const depositData = {
  assetType: "Deposit",
  name: generateDepositName(),
  symbol: generateSymbol(generateDepositName()),
  isin: generateValidISIN("AW"),
  decimals: "14",
  country: "Aruba",
  pincode: pincode,
  sidebarAssetTypes: "Deposits",
};

export const depositUpdateCollateralData = {
  amount: "11000",
  pincode: pincode,
};

export const depositMintData = {
  amount: "11000",
  pincode: pincode,
};

export const depositBurnData = {
  amount: "2000",
  pincode: pincode,
};

export const depositTransferData = {
  transferAmount: "1500",
  pincode: pincode,
};

export const topUpData = {
  amount: "1000",
  pincode: pincode,
};

export const bondMintData = {
  amount: "1000",
  pincode: pincode,
};

export const bondBurnData = {
  amount: "80",
  pincode: pincode,
};

export const bondTransferData = {
  transferAmount: "100",
  pincode: pincode,
};

export const stableCoinUpdateCollateralData = {
  amount: "10000",
  pincode: pincode,
};

export const stableCoinMintData = {
  amount: "10000",
  pincode: pincode,
};

export const stableCoinBurnData = {
  amount: "1900",
  pincode: pincode,
};

export const stableCoinTransferData = {
  transferAmount: "1000",
  pincode: pincode,
};

export const xvpSettlementData = {
  cryptocurrencyAmount: "100",
  equityAmount: "50",
  expiryDateTime: generateFutureDateTimeString(),
  autoExecute: true,
  pincode: pincode,
};
