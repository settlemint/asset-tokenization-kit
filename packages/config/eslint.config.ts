import sharedConfig from "@tools/eslint-config";

// Override the tsconfigRootDir for this package
const config = [
  ...sharedConfig,
  {
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: import.meta.dirname
      },
    },
  }
]

export default config