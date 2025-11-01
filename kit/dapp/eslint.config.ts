import sharedConfig from "@tools/eslint-config";

// Override the tsconfigRootDir for this package
const config = [
  ...sharedConfig,
  {
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    files: ["src/lib/utils/abi-signature.ts"],
    rules: {
      "unicorn/prefer-string-raw": "off",
    },
  },
  {
    rules: {
      "@typescript-eslint/unified-signatures": "off",
    },
  },
];

export default config;
