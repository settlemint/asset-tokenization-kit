const date = new Date().toISOString().replace(/(\d{4}-\d{1,2}-\d{1,2}).*/u, '$1');
const randomValue = (Math.floor(Math.random() * 10_000) + 10_000).toString().slice(1);

interface SignUpData {
  name: string;
  email: string;
  password: string;
  pincode: string;
}

interface AdminUser {
  email: string;
  password: string;
  name: string;
  pincode?: string;
}

export const signUpData: SignUpData = {
  name: `Test User ${date}-${randomValue}`,
  email: `test-${date}-${randomValue}@settlemint.com`,
  password: 'TestPassword123!',
  pincode: '123456',
} as const;

export const signUpUserData: SignUpData = {
  name: `Test Regular User ${date}-${randomValue}`,
  email: `test-user-${date}-${randomValue}@settlemint.com`,
  password: 'TestPassword123!',
  pincode: '123456',
} as const;

export const signUpTransferUserData: SignUpData = {
  name: 'Test Transfer User',
  email: `test-transfer-user-${date}-${randomValue}@settlemint.com`,
  password: 'TestPassword123!',
  pincode: '123456',
} as const;

export const adminUser: AdminUser = {
  email: 'test@example.com',
  password: 'TestPassword123!',
  name: 'Test User',
  pincode: '123456',
};
