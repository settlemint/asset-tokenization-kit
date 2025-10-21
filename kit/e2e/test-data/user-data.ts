import { randomInt } from "crypto";
import type { ResidencyStatus } from "@atk/zod/residency-status";

const date = new Date()
  .toISOString()
  .replace(/(\d{4}-\d{1,2}-\d{1,2}).*/u, "$1");
const randomValue = (randomInt(10_000) + 10_000).toString().slice(1);
const pincodeName = "Test Pincode";
const pincode = "123456";

const generateSecurePassword = (): string => {
  const lowercase = "abcdefghijklmnopqrstuvwxyz";
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const numbers = "0123456789";
  const special = "!@#$%^&*";

  const required = [
    lowercase[Math.floor(Math.random() * lowercase.length)],
    uppercase[Math.floor(Math.random() * uppercase.length)],
    numbers[Math.floor(Math.random() * numbers.length)],
    special[Math.floor(Math.random() * special.length)],
  ];

  const allChars = lowercase + uppercase + numbers + special;
  const remaining = Array.from(
    { length: 8 },
    () => allChars[Math.floor(Math.random() * allChars.length)]
  );

  const passwordArray = [...required, ...remaining];
  for (let i = passwordArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [passwordArray[i], passwordArray[j]] = [passwordArray[j], passwordArray[i]];
  }

  return passwordArray.join("");
};

const password = generateSecurePassword();
const onboardingResidencyStatus: ResidencyStatus = "resident";
interface SignUpData {
  name: string;
  email: string;
  password: string;
  pincodeName: string;
  pincode: string;
}

interface AdminUser {
  email: string;
  password: string;
  name: string;
  pincodeName: string;
  pincode?: string;
}

export type UserRole = "admin" | "user";

export const signUpData: SignUpData = {
  name: `Test User ${date}-${randomValue}`,
  email: `test-${date}-${randomValue}@settlemint.com`,
  password: password,
  pincodeName: pincodeName,
  pincode: pincode,
} as const;

export const signUpUserData: SignUpData = {
  name: `Test Regular User ${date}-${randomValue}`,
  email: `test-user-${date}-${randomValue}@settlemint.com`,
  password: password,
  pincodeName: pincodeName,
  pincode: pincode,
} as const;

export const adminUser: AdminUser = {
  email: "testadmin@settlemint.com",
  password: password,
  name: "Test Admin User",
  pincodeName: pincodeName,
  pincode: pincode,
};

export const adminRecipient: SignUpData = {
  name: `Test Admin Recipient ${date}-${randomValue}`,
  email: `testadminrecipient-${date}-${randomValue}@settlemint.com`,
  password: password,
  pincodeName: pincodeName,
  pincode: pincode,
};

export const userRecipient: SignUpData = {
  name: `Test User Recipient ${date}-${randomValue}`,
  email: `testuserrecipient-${date}-${randomValue}@settlemint.com`,
  password: password,
  pincodeName: pincodeName,
  pincode: pincode,
};

export const signUpTransferUserData: SignUpData = {
  name: `Test Transfer User ${date}-${randomValue}`,
  email: `test-transfer-user-${date}-${randomValue}@settlemint.com`,
  password: password,
  pincodeName: pincodeName,
  pincode: pincode,
} as const;

export const adminApiUser: SignUpData = {
  name: `Test Admin Api User`,
  email: `test-admin-api-user@settlemint.com`,
  password: password,
  pincodeName: pincodeName,
  pincode: pincode,
} as const;

export const signInTestData = {
  wrongPassword: "WrongPassword123!",
} as const;

export const onboardingTestData = {
  email: `admin-onboarding-${Date.now()}-${Math.random().toString(36).substring(7)}@settlemint.com`,
  password: generateSecurePassword(),
  pinCode: Math.floor(100000 + Math.random() * 900000).toString(),
  wrongPinCode: "654321",

  kycData: {
    firstName: "John",
    lastName: "Doe",
    dateOfBirth: {
      year: "1990",
      month: "Jan",
      day: "15",
      formatted: "January 15th, 1990",
    },
    countryOfResidence: "United States of America",
    residencyStatus:
      "Dual resident - I am legally/tax resident in more than one country",
    nationalId: "123-45-6789",
  },

  assetTypes: {
    bonds: "Bonds",
    equities: "Equities",
    funds: "Funds",
    stablecoins: "Stablecoins",
    deposits: "Deposits",
  },

  selectedAssetTypes: ["Bonds", "Stablecoins", "Equities", "Funds", "Deposits"],
  selectedAddons: ["Airdrops", "XvP"],

  addons: {
    airdrops: "Airdrops",
    yield: "Yield",
    xvp: "XvP",
  },

  expectedSteps: {
    admin: 9,
    regularUser: 5,
  },

  stepGroups: {
    wallet: {
      title: "Wallet",
      description: "Set up your wallet and security measures",
      steps: [
        { title: "Your Wallet", description: "View your blockchain wallet" },
        {
          title: "Secure your Wallet",
          description: "Set up protection for your wallet",
        },
        {
          title: "Recovery Codes",
          description: "Generate backup recovery codes",
        },
      ],
    },
    system: {
      title: "Deploy SMART System",
      description: "Set up your blockchain platform",
      steps: [
        {
          title: "Deploy System",
          description: "Initialize the core smart contracts",
        },
        {
          title: "Configure System",
          description: "Set up system parameters and settings",
        },
        {
          title: "Select Asset Types",
          description: "Choose supported asset types",
        },
        {
          title: "System Add-ons",
          description: "Enable optional system features",
        },
      ],
    },
    identity: {
      title: "Identity",
      description: "Establish your on-chain identity",
      steps: [
        {
          title: "Setup ONCHAINID",
          description: "Create your on-chain identity",
        },
        { title: "Verify Identity", description: "Complete KYC verification" },
      ],
    },
  },

  notifications: {
    walletCreated: "Wallet created successfully!",
    pinSetSuccess: "PIN code set successfully",
    secretCodesGenerated: "Secret codes generated successfully!",
    systemDeployed: "System deployed successfully!",
    platformSettingsSaved: "Platform settings saved successfully!",
    identityRegistered: "Identity registered successfully!",
  },

  walletSteps: ["Your Wallet", "Secure your Wallet", "Recovery Codes"],
  systemSteps: [
    "Deploy System",
    "Configure System",
    "Select Asset Types",
    "System Add-ons",
  ],
  identitySteps: ["Setup ONCHAINID", "Verify Identity"],
} as const;

export const userAdminRoles = [
  "Claim Issuer",
  "Claim Policy Manager",
  "Token Manager",
];

export const userAdminTrustedTopics = [
  "basePrice",
  "collateral",
  "assetClassification",
  "isin",
];
