const date = new Date()
  .toISOString()
  .replace(/(\d{4}-\d{1,2}-\d{1,2}).*/u, "$1");
const randomValue = (Math.floor(Math.random() * 10_000) + 10_000)
  .toString()
  .slice(1);
const pincodeName = "Test Pincode";
const pincode = "123456";
const password = "TestPassword123!";
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

export const signUpTransferUserData: SignUpData = {
  name: `Test Transfer User ${date}-${randomValue}`,
  email: `test-transfer-user-${date}-${randomValue}@settlemint.com`,
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
