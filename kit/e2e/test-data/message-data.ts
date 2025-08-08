export const successMessageData = {
  successMessageCryptocurrency: "Cryptocurrency was created successfully!",
  successMessageStablecoin: "Stablecoin was created successfully!",
  successMessageBond: "Bond was created successfully!",
  successMessageEquity: "Equity was created successfully!",
  successMessageFund: "Fund was created successfully!",
  successMessageDeposit: "Deposit was created successfully!",
  successMessage: "Success",
};

export const errorMessageData = {
  errorMessageName: "Please enter at least 1 characters",
  errorMessageSymbol:
    "Asset symbol must contain only uppercase letters (A-Z) and numbers (0-9)",
  errorMessageSymbolLength: "Asset symbol must not exceed 12 characters",
  errorMessageDecimals: "Please enter a value between 0 and 18",
  errorMessageDecimalsEmpty: "Invalid input",
  errorMessageDecimalsNegative: "Decimals cannot be negative",
  errorMessageDecimalsHigh:
    "Decimals cannot exceed 18 (ERC20 standard maximum)",
  errorMessageISIN:
    "ISIN must follow the format: 2 letter country code + 9 alphanumeric characters + 1 check digit",
  errorMessageISINLength: "ISIN must be exactly 12 characters long",
  errorMessageISINInvalid: "Invalid ISIN checksum",
  errorMessageOnlyValidNumber: "Please enter a valid number",
  errorMessageLessThanMin: "Please enter a number no less than 1",
  errorMessageGreaterThanMax:
    "Please enter a number no greater than 9007199254740991",
  errorMessageMaturityDate:
    "Maturity date must be at least 1 hour in the future",
  errorMessageDenominationAsset: "Please provide all required information",
  errorMessageManagementFee: "Please enter a value between 0 and 10000",
};
